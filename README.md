# Hardhat + Foundry Hybrid Template [![Github Actions][gha-badge]][gha] [![Hardhat][hardhat-badge]][hardhat] [![Foundry][foundry-badge]][foundry] [![License: MIT][license-badge]][license]

[gha]: https://github.com/paulrberg/hardhat-template/actions
[gha-badge]: https://github.com/paulrberg/hardhat-template/actions/workflows/ci.yml/badge.svg
[hardhat]: https://hardhat.org/
[hardhat-badge]: https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg
[foundry]: https://getfoundry.sh/
[foundry-badge]: https://img.shields.io/badge/Built%20with-Foundry-FFFBF0.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

A hybrid template combining the best of **Hardhat** and **Foundry** for developing Solidity smart contracts, with modern tooling and sensible defaults.

## ✨ Features

### 🔧 **Dual Toolchain Support**
- **[Hardhat](https://hardhat.org/)**: TypeScript integration, deployment scripts, verification
- **[Foundry](https://getfoundry.sh/)**: Fast compilation, comprehensive testing, gas optimization

### 📦 **Modern Dependency Management**
- **[Soldeer](https://soldeer.xyz/)**: Native Solidity package manager for contract dependencies
- **OpenZeppelin Contracts**: Installed via Soldeer for secure, tested contract implementations

### 🧪 **Comprehensive Testing**
- **Hardhat Tests**: TypeScript-based tests with ethers.js integration
- **Foundry Tests**: High-performance Solidity tests with fuzz testing and gas benchmarking

### 🚀 **Deployment Options**
- **Hardhat Deploy**: Feature-rich deployment system with migrations
- **Foundry Scripts**: Secure deployment with Cast wallet integration

### 🛠️ **Developer Experience**
- **ESLint v9**: Modern flat config with TypeScript support
- **Forge Formatting**: Consistent Solidity code style
- **Cross-tool Compatibility**: Bytecode alignment for seamless verification
- **TypeChain**: Generate TypeScript bindings from Foundry artifacts

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Foundry](https://getfoundry.sh/) - Install with: `curl -L https://foundry.paradigm.xyz | bash`

### Installation

1. **Use this template**
   ```bash
   # Click "Use this template" button above or clone directly
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies**
   ```bash
   bun install  # or npm install
   ```

3. **Set up configuration**
   ```bash
   bunx hardhat vars setup
   # Set required variables: INFURA_API_KEY, MNEMONIC or DEPLOYER_PRIVATE_KEY
   ```

## 📖 Usage

### Compilation
```bash
# Compile with Foundry (recommended - faster)
forge build

# Compile with Hardhat (includes TypeChain generation)
bun run compile
```

### Testing
```bash
# Run Foundry tests (with fuzz testing)
bun run test:foundry

# Run Hardhat tests (TypeScript)
bun run test:hardhat
```

### Deployment

#### Foundry Deployment (Recommended for Production)
```bash
# Deploy using Cast wallets (secure)
NETWORK=sepolia SENDER=0x... ACCOUNT=my-wallet bun run deploy:foundry
```

#### Hardhat Deployment
```bash
# Deploy using Hardhat Deploy
bun run deploy:hardhat --network sepolia
```

### Verification
```bash
# Verify deployed contracts (works with both deployment methods)
bun run task:verify
```

### Linting & Formatting
```bash
# Lint everything
bun run lint

# Format code
bun run format:write
```

## 🏗️ Project Structure

```text
├── contracts/          # Solidity contracts
├── script/             # Foundry deployment scripts
├── test/
│   ├── foundry/        # Foundry tests (.sol)
│   └── lock/           # Hardhat tests (.ts)
├── deploy/             # Hardhat deployment scripts
├── tasks/              # Hardhat tasks
├── config/             # Network and chain configurations
├── foundry.toml        # Foundry configuration
├── hardhat.config.ts   # Hardhat configuration
└── eslint.config.js    # ESLint v9 configuration
```

## 🔧 Available Scripts

### Testing
- `bun run test:foundry` - Run Foundry tests
- `bun run test:hardhat` - Run Hardhat tests

### Deployment
- `bun run deploy:foundry` - Deploy with Foundry
- `bun run deploy:hardhat` - Deploy with Hardhat

### Development
- `bun run compile` - Compile contracts
- `bun run lint` - Lint all code
- `bun run format:write` - Format all code
- `bun run clean` - Clean build artifacts

### Documentation
- `forge doc` - Generate documentation from NatSpec

## ⚙️ Configuration

### Cross-tool Compatibility
The template ensures bytecode compatibility between Foundry and Hardhat:
- `foundry.toml`: `bytecode_hash = "none"`
- `hardhat.config.ts`: `bytecodeHash: "none"`

This allows Hardhat to verify contracts deployed with Foundry seamlessly.

### Network Configuration
Networks are configured in `config/networks.ts` with support for:
- Mainnet, Polygon, Arbitrum, Optimism
- Testnets (Sepolia, etc.)
- Local development (Anvil, Ganache)

## 📚 Key Dependencies

### Smart Contract Development
- **OpenZeppelin Contracts** (via Soldeer)
- **Forge Standard Library** (via Soldeer)

### Development Tools
- **Hardhat** - Ethereum development environment
- **Foundry** - Rust-based toolkit
- **TypeChain** - TypeScript bindings
- **ESLint v9** - Code linting
- **Solhint** - Solidity linting

## 🎯 Why This Template?

### 🏃‍♂️ **Best of Both Worlds**
- **Foundry**: Lightning-fast compilation and testing
- **Hardhat**: Rich TypeScript ecosystem and tooling

### 🔒 **Security First**
- OpenZeppelin contracts via native package manager
- Secure deployment with Cast wallet integration
- Comprehensive test coverage

### 🚀 **Developer Experience**
- Modern tooling (ESLint v9, Soldeer, TypeScript 5.9)
- Cross-compatible bytecode for seamless workflows
- Extensive documentation and examples

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under MIT - see the [LICENSE](LICENSE) file for details.