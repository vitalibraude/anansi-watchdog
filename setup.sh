#!/bin/bash
# Anansi Watchdog Setup Script

set -e

echo "🕷️  Anansi Watchdog Setup"
echo "=========================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then 
    echo "✅ Python $python_version detected"
else
    echo "❌ Python $required_version or higher is required"
    echo "   Current version: $python_version"
    exit 1
fi
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "⚠️  Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo "✅ pip upgraded"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - GOOGLE_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create output directories
echo "Creating output directories..."
mkdir -p outputs/{reports,logs,data}
echo "✅ Output directories created"
echo ""

# Display next steps
echo "=========================="
echo "✅ Setup Complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo ""
echo "1. Activate the virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Add your API keys to .env file:"
echo "   nano .env"
echo ""
echo "3. Run a simple test:"
echo "   python anansi.py -t tests/alignment/helpfulness.json -m openai:gpt-4"
echo ""
echo "4. Or run all tests:"
echo "   python anansi.py -t tests/*/*.json -m openai:gpt-4 anthropic:claude-3-5-sonnet"
echo ""
echo "5. Try the examples:"
echo "   python examples/simple_example.py"
echo ""
echo "📖 For more information, see README.md"
echo ""
