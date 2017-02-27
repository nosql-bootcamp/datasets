#Rendu du workshop NoSQL

L'idée était de simuler l'acquisition de données issues de capteur de mesure de qualité de l'air. L'architecture est composée d'un cluster Cassandra, d'un cluster ElasticSearch et d'un Kibana. Cassandra 3.10, ElasticSearch 5.2.1 et Kibana 5.2.1 ont été utilisés dans le cadre de ce workshop.

Python 2.7 a été utilisé pour les étapes d'import des données. Le gestionnaire de paquet pip est nécessaire pour gérer les dépendances. Il est nécessaire d'installer les dépandances avant de lancer une étape d'importation via les commandes : 
```
  cd src
  pip install -r requirements.txt
```

##Modélisation des données Cassandra

Toutes les données se trouvent dans la même table. Le schéma est décrit ci-dessous.

![Database model](images/cassandra-diagram.png)


Le fichier cql/init.cql permet d'initialiser Cassandra avec le keyspace et la table adéquat.
Pour l'exécuter il suffit de taper la commande suivante depuis le dossier cassandra :
```
  bin/cqlsh -f your_path/cql/init.cql
```
    
##Import des données dans Cassandra
Afin d'importer les données contenu dans les 3 fichiers csv, il suffit de lancer l'exécution de import_from_csv_to_cassandra.py de la façon suivante :
```
  python your_path/import_from_csv_to_cassandra.py hosts port
```
afin de renseigner plusieurs hosts, il suffit de les séparer par des ,

##Modélisation des données ElasticSearch
Les données sont divisées en 3 index, un par station. Toutes les données sont cependant du même type : measure.
Les index sont crée automatiquement par le driver ElasticSearch Python.
Les colunnes de Cassandra ont été transposés à ElasticSearch avec le même nom sauf pour le champ correspondant au timestamp (time). Dans ElasticSearch, ce champ s'appelle @timestamp afin de respecter la configuration par défaut de logstash et ainsi faciliter la configuration pour TimeLion.
  
##Import des données dans ElasticSearch depuis Cassandra
Afin d'importer les données contenu dans Cassandra, il suffit de lancer l'exécution de import_from_cassandra_to_elastic.py de la façon suivante :
```
  python your_path/import_from_cassandra_to_elastic.py cassandra_hosts cassandra_port elasticsearch_hosts elasticsearch_port
```  
afin de renseigner plusieurs hosts, il suffit de les séparer par des ,

##Visualisation des données
Des screenshots des visualisations qui ont peut être produites à partir des données sont disponibles dans le dossier screenshots. Il est possible de visualiser la requête écrite pour les visualiations NO2 et PM10. Les autres requêtes sont très similaires.
