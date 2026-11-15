import sqlite3

conn = sqlite3.connect("nofa_dev.db")
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE company_profiles ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'")
    conn.commit()
    print("Added currency column to company_profiles.")
except Exception as e:
    print("Notice:", e)

# Update Nofa Beauty Center to OMR
cursor.execute("SELECT id FROM tenants WHERE slug = 'nofa-beauty-center'")
row = cursor.fetchone()
if row:
    tenant_id = row[0]
    cursor.execute("UPDATE company_profiles SET currency = 'OMR' WHERE tenant_id = ?", (tenant_id,))
    cursor.execute("UPDATE services SET currency = 'OMR' WHERE tenant_id = ?", (tenant_id,))
    conn.commit()
    print("Set Nofa Beauty Center currency to OMR in database.")

conn.close()
