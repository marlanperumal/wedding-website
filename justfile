# Wedding website — task runner
# Run `just` to list available recipes.

set dotenv-load := true
set dotenv-filename := ".env.local"

# List available recipes
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Copy .env.example to .env.local if it doesn't exist yet
env:
    @test -f .env.local || cp .env.example .env.local
    @echo ".env.local ready — fill in ADMIN_PASSPHRASE_HASH and COOKIE_SECRET (see 'just secret' and 'just hash')."

# Generate a random 32-byte hex COOKIE_SECRET
secret:
    @node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a bcrypt ADMIN_PASSPHRASE_HASH from a passphrase: just hash "my passphrase"
hash passphrase:
    @node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "{{passphrase}}"

# Start the local Postgres container
db-up:
    docker compose up -d

# Stop the local Postgres container
db-down:
    docker compose down

# Apply database migrations
migrate:
    pnpm prisma migrate deploy

# Regenerate the Prisma client
generate:
    pnpm prisma generate

# Seed events + test invite
seed:
    pnpm prisma db seed

# Open Prisma Studio
studio:
    pnpm prisma studio

# Full first-time setup: deps, env, database, migrations, seed
setup: install env db-up migrate generate seed
    @echo "Setup complete. Run 'just dev' to start the dev server."

# Start the dev server (http://localhost:3000)
dev:
    pnpm dev

# Run the test suite
test:
    pnpm test

# Type-check only
typecheck:
    pnpm tsc --noEmit

# Production build
build:
    pnpm build
