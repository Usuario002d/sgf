INSERT INTO account_plans (
    number,
    description,
    writable,
    type,
    class,
    state,
    created_at,
    updated_at
) VALUES
('1.0.0.0.00', 'Despesas Correntes', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.1.0.0.00', 'Despesas com o Pessoal', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.1.1.0.00', 'Salários e Remunerações', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.1.1.1.00', 'Pessoal Civil', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.1.2.0.00', 'Demais Despesas com o Pessoal', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.1.2.1.00', 'Pessoal Civil', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.2.0.0.00', 'Bens e Serviços', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.2.1.0.00', 'Bens', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.2.2.0.00', 'Serviços', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.4.0.0.00', 'Transferências Correntes', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.6.0.0.00', 'Exercicios Findos', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.6.1.0.00', 'Retroactivos Salariais do Exercicio Corrente para Pessoal Civil', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('1.6.2.0.00', 'Retroactivos de Bens e Servicos', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('2.0.0.0.00', 'Despesas de Capital', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('2.1.0.0.00', 'Bens de Capital', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('2.1.1.0.00', 'Construções', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('2.1.2.0.00', 'Maquinaria, Equipamento e Mobiliario', 'controll', 'budject', 'A', 1, NOW(), NOW()),
('2.1.3.0.00', 'Meios de Transporte', 'controll', 'budject', 'A', 1, NOW(), NOW());

INSERT INTO account_plan_entries  (
    account_plan_number,
    start_posting_month,
    end_posting_month,
    initial_allocation,
    final_allocation,
    account_plan_year_id,
    account_plan_id,
    parent_id,
    state,
    created_at,
    updated_at
) VALUES
('1.0.0.0.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.0.0.0.00'),null, 1, NOW(), NOW()),
('1.1.0.0.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.1.0.0.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.0.0.0.00'), 1, NOW(), NOW()),
('1.1.1.0.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.1.1.0.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.1.0.0.00'), 1, NOW(), NOW()),
('1.1.1.1.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.1.1.1.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.1.1.0.00'), 1, NOW(), NOW()),
('1.1.2.0.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.1.2.0.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.1.0.0.00'), 1, NOW(), NOW()),
('1.1.2.1.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.1.2.1.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.1.2.0.00'), 1, NOW(), NOW()),
('1.2.0.0.00',MONTH(NOW()),MONTH(NOW()),0,0, (select id from account_plan_years where year=2024), (select acc.id from account_plans acc where acc.number='1.2.0.0.00'),(select parent.id from account_plan_entries parent where parent.account_plan_number='1.0.0.0.00'), 1, NOW(), NOW());