start:
	@docker-compose up -d
	@docker-compose logs -f

stop:
	@docker-compose down

logs:
	@docker-compose logs -f

console:
	(cd services/migrations && hasura console)
	
migrate:
	@docker-compose up migrations