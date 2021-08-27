
console:
	(cd services/migrations && hasura console)
	
migrate:
	@docker-compose up migrations