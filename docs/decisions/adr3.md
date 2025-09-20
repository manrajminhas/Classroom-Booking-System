# ADR3 – Server-Side Data Store  

**Title:** Use PostgreSQL for the Server-Side Data Store  

**Status:** Accepted  

**Context:**  
- Allowed options: SQLite or PostgreSQL.  
- The system must support concurrent bookings without double-booking.  
- PostgreSQL provides good scalability.  
- SQLite is lightweight, but not ideal for multi-user concurrent environments which is what we need.  

**Decision:**
We will use PostgreSQL as the Server-Side Data Store.  

**Consequences:**  
- ✅ Strong concurrency control which is critical for bookings.  
- ✅ Works well Docker packaging which this project requires.  
- ✅ Easy to import the CSV classroom data into schema.  
- ✅ Scales better if the project grows beyond the demo.  

- ❌ Heavier setup than SQLite.  
- ❌ Requires schema migrations when requirements change.  
- ❌ More complex to administer compared to SQLite.  