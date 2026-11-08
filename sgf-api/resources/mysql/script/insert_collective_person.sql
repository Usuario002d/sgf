account_plan_financial_number

INSERT INTO providers (name, description, nuit, nib, account_plan_financial_number,created_at,updated_at)
VALUES
('FIPAC_AGUAS', 'Fipac aguas da regiao sul','100000001','111111111111', '421', NOW(), NOW()),
('EDM', 'Electricidde de Moçambique','100000002','111111111111', '422', NOW(), NOW());
commit;

INSERT INTO banks (name, description, nuit, nib, account_plan_financial_number,created_at,updated_at)
VALUES
('BCI', 'Banco comercia de investimento','110000001','111111111111', '421', NOW(), NOW()),
('BIM', 'Millennium BIM','100000002','120000001', '422', NOW(), NOW());
commit;