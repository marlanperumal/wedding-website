# Wedding website — task runner
# Run `just` to list available recipes.
#
# Note: just does NOT load .env.local itself. Next.js loads it for dev/build,
# and prisma.config.ts loads it for the Prisma recipes. We deliberately avoid
# `set dotenv-load` because just's dotenv parser performs shell-style `$`
# expansion, which corrupts values containing `$` (e.g. bcrypt hashes).

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

# Start local services (Postgres + Mailpit email catcher)
db-up:
    docker compose up -d

# Stop local services (Postgres + Mailpit)
db-down:
    docker compose down

# Open the Mailpit web inbox (captured dev emails)
mail:
    @echo "Mailpit inbox: http://localhost:8025"
    @command -v xdg-open >/dev/null && xdg-open http://localhost:8025 >/dev/null 2>&1 || true

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
