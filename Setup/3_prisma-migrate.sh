~/Github_Nabil_Tester/e-commerce-api (mvp ✗)    npx prisma migrate dev --name init_users_and_products

Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "ecommerce_db" at "localhost:3306"

MySQL database ecommerce_db created at localhost:3306

Applying migration `20260420101542_init_users_and_products`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20260420101542_init_users_and_products/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 91ms


~/Github_Nabil_Tester/e-commerce-api (mvp ✗) mysql -u root -p
mysql: Deprecated program name. It will be removed in a future release, use '/usr/bin/mariadb' instead
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 16
Server version: 12.2.2-MariaDB Arch Linux

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| ecommerce_db       |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.000 sec)

MariaDB [(none)]>

