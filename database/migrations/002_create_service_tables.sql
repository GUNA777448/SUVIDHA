-- Create electricity_bills table
CREATE TABLE IF NOT EXISTS electricity_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    billing_period VARCHAR(20) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_electricity_consumer_id ON electricity_bills(consumer_id);
CREATE INDEX idx_electricity_status ON electricity_bills(status);

-- Create gas_bills table
CREATE TABLE IF NOT EXISTS gas_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    billing_period VARCHAR(20) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gas_consumer_id ON gas_bills(consumer_id);
CREATE INDEX idx_gas_status ON gas_bills(status);

-- Create water_bills table
CREATE TABLE IF NOT EXISTS water_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    billing_period VARCHAR(20) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_water_consumer_id ON water_bills(consumer_id);
CREATE INDEX idx_water_status ON water_bills(status);

-- Create property_tax table
CREATE TABLE IF NOT EXISTS property_tax (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(50) UNIQUE NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    property_address TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_id ON property_tax(property_id);
CREATE INDEX idx_property_status ON property_tax(status);

COMMENT ON TABLE electricity_bills IS 'Stores electricity billing information';
COMMENT ON TABLE gas_bills IS 'Stores gas billing information';
COMMENT ON TABLE water_bills IS 'Stores water billing information';
COMMENT ON TABLE property_tax IS 'Stores property tax information';
