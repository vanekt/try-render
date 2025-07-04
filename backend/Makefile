.PHONY: mc mu md

MIGRATIONS_PATH=migrations
MIGRATE_CMD?=migrate
DB_URL?=$(DATABASE_URL)
ENV_FILE?=.env

include $(ENV_FILE)
export $(shell sed 's/=.*//' $(ENV_FILE) | xargs)

mc:
	@if [ -z "$(word 2,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make mc migration_name"; \
		exit 1; \
	fi; \
	$(MIGRATE_CMD) create -ext sql -dir $(MIGRATIONS_PATH) -seq $(word 2,$(MAKECMDGOALS))

mu:
	$(MIGRATE_CMD) -database "$(DB_URL)" -path $(MIGRATIONS_PATH) up

md:
	$(MIGRATE_CMD) -database "$(DB_URL)" -path $(MIGRATIONS_PATH) down

%:
	@: 