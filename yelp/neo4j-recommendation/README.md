# Yelp Neo4j

## Préparation des données

Quelques pièges dans les données, qui peuvent être bloquant lors de l'import neo4J

* Villes avec des charactères ',' dans le nom
* Nom d'établissement avec des charactères '"'
* Collisions d'ids entres les users et les business
* Relations faisant référence à des users inexistants
* Le champ name contient pas mal de caractères spéciaux, il vaut donc mieux les neutraliser en le "double quotant"

## Import neo4J

```
rm -rf ./data/databases/yelp.db && ./bin/neo4j-admin import --nodes:User ~/projets/yelp/out/users.csv --nodes:Business ~/projets/yelp/out/business.csv --relationships:LIKED ~/projets/yelp/out/notes.csv --database=yelp.db --id-type string --ignore-missing-nodes=true
```

## Requete neo4j

### Suggestion par établissement (ceux qui ont aimé <commerce> on aussi aimé <autreCommerce>)

```cypher
MATCH (e:User)-[:LIKED]->(b:Business {name:"Groucho's Deli"})<-[:LIKED]-(otherUser:User)-[:LIKED]->(otherBusiness:Business)
WHERE any(cat1 IN otherBusiness.categories WHERE cat1 IN b.categories)
RETURN e, b, otherUser, otherBusiness;
```

### Suggestion par user avec catégorie

```
MATCH (e:User {user_id: "u_dyhTHLIf6eWBvU78Y3T06A"})-[:LIKED]->(b:Business)<-[:LIKED]-(otherUser:User)-[:LIKED]->(otherBusiness:Business)
WHERE "Restaurants" IN b.categories
AND "Restaurants" IN otherBusiness.categories
RETURN e, b, otherUser, otherBusiness;
```


### Suggestion par liste d'établissement

```
MATCH (e:User)-[:LIKED]->(b:Business)<-[:LIKED]-(otherUser:User)-[:LIKED]->(otherBusiness:Business)
WHERE b.name IN ["Zur Kate", "Groucho's Deli", "Potluck Restaurant"]
AND any(cat1 IN otherBusiness.categories WHERE cat1 IN b.categories)
RETURN e, b, otherUser, otherBusiness;
```
