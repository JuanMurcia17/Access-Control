# OpenZeppelin AccessControl Demo

Demostración académica interactiva de control de acceso basado en roles (RBAC) en contratos inteligentes Solidity usando [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/5.x/access-control), con frontend en Next.js.

## Propósito

Este proyecto es un recurso práctico para entender cómo funciona el módulo **AccessControl** de OpenZeppelin en contratos inteligentes. Demuestra:

- Cómo definir y gestionar roles en un contrato inteligente
- Cómo otorgar y revocar roles
- Cómo restringir el acceso a funciones según roles
- Cómo interactuar con el contrato desde un frontend web

## Tech Stack

| Capa       | Tecnología                                |
| ---------- | ----------------------------------------- |
| Frontend   | Next.js 16 (App Router)                  |
| Lenguaje   | TypeScript + Solidity 0.8.27             |
| Estilos    | Tailwind CSS 4                            |
| Linting    | ESLint 9 + eslint-config-next            |
| Contratos  | Solidity + OpenZeppelin Contracts 5.x    |
| Blockchain | Hardhat 2 (compilación, testing, deploy) |
| Wallet     | MetaMask (ethers.js v6)                  |

## Contrato: AccessControlDemo.sol

El contrato define **3 roles**:

| Rol                  | Descripción                          |
| -------------------- | ------------------------------------ |
| `DEFAULT_ADMIN_ROLE` | Puede otorgar y revocar cualquier rol |
| `MINTER_ROLE`        | Puede ejecutar la función `mint()`   |
| `BURNER_ROLE`        | Puede ejecutar la función `burn()`   |

- El deployer recibe automáticamente `DEFAULT_ADMIN_ROLE`
- Las funciones `mint()` y `burn()` están protegidas con `onlyRole`

## Estructura del Proyecto

```
Access-Control/
├── src/
│   ├── app/                        # Páginas y layouts (Next.js App Router)
│   ├── components/
│   │   └── AccessControlDemo.tsx   # Componente principal de la demo
│   └── lib/
│       ├── contract.json           # ABI + bytecode del contrato
│       └── ethereum.d.ts           # Tipos para window.ethereum
├── contracts/
│   └── AccessControlDemo.sol       # Contrato Solidity
├── scripts/
│   └── deploy.cjs                  # Script de despliegue con Hardhat
├── test/
│   └── AccessControlDemo.cjs       # Tests del contrato (10 tests)
├── hardhat.config.cjs              # Configuración de Hardhat
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (viene con Node.js)
- [MetaMask](https://metamask.io/) instalado en el navegador

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/JuanMurcia17/Access-Control.git

# Ir al directorio del proyecto
cd Access-Control

# Instalar dependencias
npm install
```

## Comandos Disponibles

```bash
# Compilar el contrato Solidity
npx hardhat compile

# Ejecutar tests del contrato (10 tests)
npx hardhat test

# Desplegar contrato en red local de Hardhat
npx hardhat run scripts/deploy.cjs

# Correr frontend en modo desarrollo
npm run dev

# Build de producción
npm run build

# Lint
npm run lint
```

## Cómo Hacer la Demostración en Clase

### Preparación (antes de la clase)

1. Asegúrate de tener MetaMask instalado en Chrome/Firefox
2. Configura MetaMask con una red de prueba local:
   - Abre MetaMask > Redes > Agregar red manualmente
   - **Nombre**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Moneda**: ETH
3. Inicia el nodo local de Hardhat en una terminal:
   ```bash
   npx hardhat node
   ```
4. Importa una cuenta de prueba en MetaMask:
   - Copia una clave privada del output de `npx hardhat node`
   - En MetaMask: Importar cuenta > Pegar clave privada
5. En otra terminal, inicia el frontend:
   ```bash
   npm run dev
   ```

### Pasos de la Demostración en Vivo

1. **Conectar Wallet**: Haz clic en "Conectar MetaMask" y autoriza la conexión
2. **Desplegar Contrato**: Haz clic en "Desplegar AccessControlDemo" y confirma la transacción
3. **Demostrar que sin roles no se puede hacer mint**:
   - En "Funciones Restringidas", ingresa una dirección y haz clic en "Ejecutar Mint"
   - Verás el mensaje: _"No tienes permiso para ejecutar mint. Necesitas el rol MINTER_ROLE."_
4. **Otorgar rol MINTER_ROLE**:
   - En "Gestión de Roles", ingresa tu propia dirección
   - Haz clic en "Otorgar" en la sección MINTER_ROLE
5. **Ejecutar mint con éxito**:
   - Ahora haz clic en "Ejecutar Mint" de nuevo
   - Verás: _"Mint ejecutado"_ y el contador aumentará
6. **Revocar rol y demostrar que falla de nuevo**:
   - Revoca el MINTER_ROLE
   - Intenta hacer mint de nuevo → falla
7. **Repetir con BURNER_ROLE** para mostrar que cada rol es independiente

### Puntos Clave para la Exposición

- `DEFAULT_ADMIN_ROLE` es el único que puede otorgar/revocar otros roles
- Cada función protegida requiere un rol específico
- Los roles son independientes entre sí
- Todo se valida on-chain (no es solo UI)

## Tests

El proyecto incluye 10 tests que cubren:

```
AccessControlDemo
  Deployment
    ✔ should grant DEFAULT_ADMIN_ROLE to deployer
    ✔ should NOT grant MINTER_ROLE to deployer
    ✔ should NOT grant BURNER_ROLE to deployer
  Mint function
    ✔ should FAIL if caller does NOT have MINTER_ROLE
    ✔ should SUCCEED if caller HAS MINTER_ROLE
  Burn function
    ✔ should FAIL if caller does NOT have BURNER_ROLE
    ✔ should SUCCEED if caller HAS BURNER_ROLE
  Role management
    ✔ should allow admin to grant and revoke roles
    ✔ should FAIL when non-admin tries to grant roles
    ✔ should FAIL to mint after role is revoked
```

## Licencia

Proyecto con fines académicos y educativos.


