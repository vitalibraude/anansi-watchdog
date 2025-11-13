"""
Model Interface for Multi-LLM Support

Provides a unified interface for interacting with different AI models.
"""

import os
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum


class ModelProvider(Enum):
    """Supported AI model providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    META = "meta"
    CUSTOM = "custom"


@dataclass
class ModelResponse:
    """Standardized response from an AI model"""
    model_name: str
    provider: ModelProvider
    prompt: str
    response: str
    timestamp: float
    latency_ms: float
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert response to dictionary"""
        return {
            'model_name': self.model_name,
            'provider': self.provider.value,
            'prompt': self.prompt,
            'response': self.response,
            'timestamp': self.timestamp,
            'latency_ms': self.latency_ms,
            'metadata': self.metadata,
            'error': self.error
        }


class ModelInterface(ABC):
    """Abstract base class for AI model interfaces"""
    
    def __init__(self, model_name: str, provider: ModelProvider):
        self.model_name = model_name
        self.provider = provider
        self.api_key = self._load_api_key()
    
    @abstractmethod
    def _load_api_key(self) -> Optional[str]:
        """Load API key from environment or config"""
        pass
    
    @abstractmethod
    def query(self, prompt: str, **kwargs) -> ModelResponse:
        """Send a query to the model and return response"""
        pass
    
    def _create_response(
        self,
        prompt: str,
        response: str,
        start_time: float,
        metadata: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> ModelResponse:
        """Helper to create standardized ModelResponse"""
        end_time = time.time()
        return ModelResponse(
            model_name=self.model_name,
            provider=self.provider,
            prompt=prompt,
            response=response,
            timestamp=start_time,
            latency_ms=(end_time - start_time) * 1000,
            metadata=metadata,
            error=error
        )


class OpenAIInterface(ModelInterface):
    """Interface for OpenAI models (ChatGPT)"""
    
    def __init__(self, model_name: str = "gpt-4"):
        super().__init__(model_name, ModelProvider.OPENAI)
        self.client = None
        self._initialize_client()
    
    def _load_api_key(self) -> Optional[str]:
        return os.getenv("OPENAI_API_KEY")
    
    def _initialize_client(self):
        """Initialize OpenAI client"""
        if self.api_key:
            try:
                import openai
                self.client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                print("Warning: openai package not installed. Install with: pip install openai")
    
    def query(self, prompt: str, **kwargs) -> ModelResponse:
        """Query OpenAI model"""
        start_time = time.time()
        
        if not self.client:
            return self._create_response(
                prompt, "", start_time,
                error="OpenAI client not initialized. Check API key."
            )
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
            response_text = response.choices[0].message.content
            metadata = {
                'finish_reason': response.choices[0].finish_reason,
                'usage': dict(response.usage) if response.usage else None
            }
            
            return self._create_response(prompt, response_text, start_time, metadata)
        
        except Exception as e:
            return self._create_response(prompt, "", start_time, error=str(e))


class AnthropicInterface(ModelInterface):
    """Interface for Anthropic models (Claude)"""
    
    def __init__(self, model_name: str = "claude-3-5-sonnet-20241022"):
        super().__init__(model_name, ModelProvider.ANTHROPIC)
        self.client = None
        self._initialize_client()
    
    def _load_api_key(self) -> Optional[str]:
        return os.getenv("ANTHROPIC_API_KEY")
    
    def _initialize_client(self):
        """Initialize Anthropic client"""
        if self.api_key:
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except ImportError:
                print("Warning: anthropic package not installed. Install with: pip install anthropic")
    
    def query(self, prompt: str, **kwargs) -> ModelResponse:
        """Query Anthropic model"""
        start_time = time.time()
        
        if not self.client:
            return self._create_response(
                prompt, "", start_time,
                error="Anthropic client not initialized. Check API key."
            )
        
        try:
            max_tokens = kwargs.pop('max_tokens', 1024)
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
            response_text = response.content[0].text
            metadata = {
                'stop_reason': response.stop_reason,
                'usage': {
                    'input_tokens': response.usage.input_tokens,
                    'output_tokens': response.usage.output_tokens
                }
            }
            
            return self._create_response(prompt, response_text, start_time, metadata)
        
        except Exception as e:
            return self._create_response(prompt, "", start_time, error=str(e))


class GoogleInterface(ModelInterface):
    """Interface for Google models (Gemini)"""
    
    def __init__(self, model_name: str = "gemini-pro"):
        super().__init__(model_name, ModelProvider.GOOGLE)
        self.client = None
        self._initialize_client()
    
    def _load_api_key(self) -> Optional[str]:
        return os.getenv("GOOGLE_API_KEY")
    
    def _initialize_client(self):
        """Initialize Google Generative AI client"""
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
            except ImportError:
                print("Warning: google-generativeai package not installed. Install with: pip install google-generativeai")
    
    def query(self, prompt: str, **kwargs) -> ModelResponse:
        """Query Google Gemini model"""
        start_time = time.time()
        
        if not self.client:
            return self._create_response(
                prompt, "", start_time,
                error="Google client not initialized. Check API key."
            )
        
        try:
            response = self.client.generate_content(prompt, **kwargs)
            response_text = response.text
            metadata = {
                'finish_reason': response.candidates[0].finish_reason if response.candidates else None,
                'safety_ratings': [
                    {
                        'category': rating.category.name,
                        'probability': rating.probability.name
                    }
                    for rating in response.candidates[0].safety_ratings
                ] if response.candidates else []
            }
            
            return self._create_response(prompt, response_text, start_time, metadata)
        
        except Exception as e:
            return self._create_response(prompt, "", start_time, error=str(e))


class ModelFactory:
    """Factory for creating model interfaces"""
    
    @staticmethod
    def create(provider: str, model_name: Optional[str] = None) -> ModelInterface:
        """
        Create a model interface for the specified provider
        
        Args:
            provider: Provider name (openai, anthropic, google)
            model_name: Optional specific model name
        
        Returns:
            ModelInterface instance
        """
        provider = provider.lower()
        
        if provider == "openai":
            return OpenAIInterface(model_name or "gpt-4")
        elif provider == "anthropic":
            return AnthropicInterface(model_name or "claude-3-5-sonnet-20241022")
        elif provider == "google":
            return GoogleInterface(model_name or "gemini-pro")
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    @staticmethod
    def create_all_defaults() -> Dict[str, ModelInterface]:
        """Create interfaces for all default models"""
        return {
            'gpt-4': ModelFactory.create('openai', 'gpt-4'),
            'gpt-3.5-turbo': ModelFactory.create('openai', 'gpt-3.5-turbo'),
            'claude-3-5-sonnet': ModelFactory.create('anthropic', 'claude-3-5-sonnet-20241022'),
            'claude-3-opus': ModelFactory.create('anthropic', 'claude-3-opus-20240229'),
            'gemini-pro': ModelFactory.create('google', 'gemini-pro'),
        }
