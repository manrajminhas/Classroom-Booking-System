# Cycle 2

Released after Cycle 1 is complete.

## What to Do

#### Required: Improve and Retrospect Based on Feedback

- Deliver at least three verifiable improvements.
- In your change log, state: what changed, why, and the impact (with demo or log evidence).

#### 5.2 Choose one or more Advanced Capabilities

Note: Completing two; completing 3 or more is a bonus mark. We look only for the behavior and evidence, not how you implement it.

1) Lists promptly reflect the latest changes  
   Behavior: after booking/canceling, relevant lists update without restarting the app (refresh or back-to-list shows changes).  
   Evidence: screen recording or logs showing action → list updated.
        
2) Readable during busy or maintenance periods  
   Behavior: while users are continuously creating/canceling bookings, or during a maintenance simulation, queries remain available; the UI shows a read-only or possible delay notice.  
   Evidence: recording that shows the process and the notice.
        
3) A single external API entry point  
   Behavior: the browser only accesses data through one API prefix (for example, /api/...), not scattered backend addresses; at least one page fetches multiple data blocks with a single aggregated request.  
   Evidence: browser Network panel or capture plus an example of the aggregated JSON.
        
4) Read / Write Split Architecture  
   Behavior: while continuous booking/canceling is happening, the search page remains usable (no errors or freezes).  
   Evidence: recording that shows parallel repeated bookings/cancellations and normal browsing of queries.

5) AI endpoint  
   Behavior: expose your app as an MCP server to allow AI agents to book rooms for users.
   Evidence: configure an agent such as Claude with the appropriate endpoint to use MCP.

---
## Deliverables

## Considerations