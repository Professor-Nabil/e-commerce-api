- [ ] DATABASE
      Moving away from auto-incrementing IDs prevents "Insecure Direct Object Reference" (IDOR) attacks—basically, hackers can't just change id=1 to id=2 to scrape your entire database. We can switch to UUIDs or CUIDs later in the schema, but for now, let's keep everything automatic in your tests.
