# Grafana Dashboard Setup

## Scene 2: Grafana Dashboard (45 seconds)

### Setup Grafana (DO THIS NOW):

#### Access Grafana
- URL: http://localhost:3000
- Login: admin / admin

#### Import Dashboard
- Dashboard ID: 15489 (Node Exporter Full)
- Or create a custom dashboard as described below.

### Create Custom Dashboard with these panels:

1. **Block Production Rate**
   - Query: `rate(tendermint_consensus_height[1m])`
   - Description: Shows blocks/second

2. **Transaction Throughput**
   - Query: `rate(http_requests_total{endpoint="/commit"}[1m])`
   - Description: Shows commits/second

3. **Database Query Performance**
   - Query: `rate(pg_stat_database_tup_fetched[1m])`
   - Description: Shows DB reads/second

4. **IPFS Pin Success Rate**
   - Query: `rate(ipfs_pin_success[1m])`
   - Description: Shows successful pins

5. **Sequencer Anchor Rate**
   - Query: `rate(anchor_posted_total[1m])`
   - Description: Shows anchors/minute

6. **System Resource Usage**
   - Panels for: CPU, Memory, Network I/O

### Screen Recording Notes
- Show live dashboard with metrics updating

### PowerShell Commands
```powershell
# Access Grafana
http://localhost:3000
# Login: admin / admin

# Import dashboard
# Dashboard ID: 15489 (Node Exporter Full)
# Or create custom dashboard
