INSERT INTO internal_requests (
 sequence,
request_number,
requestor_name,
requestor_department,
operation_date,
initial_availability_account_buject,
current_account_budject_balance,
final_account_buject_balance,
total_requested_value,
justification,
sector_budject, 
chapter_budject,
clause_budject,
clause_number_budject,  
account_plan_year_id,
provider_id,
account_plan_budject_id,
account_plan_financial_id, 
state,
created_by,
created_at,
) VALUES
('L', 100,'Combustivel',100,W(), W(), W()),
('KG', '422',1, W(), W());




INSERT INTO internal_request_items (
 quantification,
 quantity,
 description,
 unitPrice,
 operation_date,
 internal_request_id,
 created_at,
 updated_at
) VALUES
('L', 100,'Combustivel',100,W(), W(), W()),
('KG', '422',1, W(), W());

commit;