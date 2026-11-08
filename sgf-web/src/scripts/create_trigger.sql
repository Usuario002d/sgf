--Aceder
sudo nano /etc/mysql/my.cnf


-- Acidionar essa linha
[mysqld]
log_bin_trust_function_creators = 1


--Executar o Comando
DELIMITER //

CREATE TRIGGER validate_account_number_before_insert
BEFORE INSERT ON account_plans
FOR EACH ROW
BEGIN
    DECLARE parent_count INT;

    -- Verifica se é uma conta filha (movimentável)
    IF NEW.writable = 'moviment' THEN
        -- Procurar a conta mãe que corresponde à sequência numérica
        SELECT COUNT(*) INTO parent_count
        FROM account_plans
        WHERE NEW.number LIKE CONCAT(number, '%')
          AND writable = 'controll'
        LIMIT 1;

        -- Se não encontrar a conta mãe, lançar um erro
        IF parent_count = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Conta mãe não encontrada ou não é uma conta controladora';
        END IF;
    END IF;

END//

DELIMITER ;

commit;