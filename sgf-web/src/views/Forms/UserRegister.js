import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createUser, fetchPermissions } from "services/accountService";
import styled from "styled-components";
import Spinner from "../../config/spinner/spinner";
import { FaUserPlus, FaShieldAlt } from "react-icons/fa";
import { MdOutlineRefresh } from "react-icons/md";

const PageHeader = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f1f8f4 65%, #fdf8ec 100%);
  border: 1px solid #d5e0da;
  border-left: 4px solid #0f5132;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 41, 34, 0.04);
  padding: 0.6rem 1.1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border: 1px solid #d5e0da;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(15, 41, 34, 0.05);
  margin-bottom: 0.85rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 0.6rem 1.05rem;
  border-bottom: 1px solid #d5e0da;
  background: linear-gradient(90deg, #f2f8f5 0%, #ffffff 70%, #fefaf2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PermissionGroupCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 100%;
  overflow: hidden;
  transition: border-color 0.15s ease;
  &:hover {
    border-color: #cbd5e1;
  }
`;

const PermissionGroupHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserRegister = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    profile: "",
    language: "pt",
    isActive: false,
    isTech: false,
    isAdmin: false,
    isSuperAdmin: false,
  });

  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetchPermissions();
      setPermissions(response || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((permissionId) => permissionId !== id)
        : [...prevSelected, id]
    );
  };

  const handleUserDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (
      !userData.name ||
      !userData.email ||
      !userData.phone ||
      !userData.birthDate ||
      !userData.profile
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos obrigatórios",
        text: "Por favor, preencha todos os campos de identificação do utilizador.",
        confirmButtonColor: "#1e40af",
      });
      return false;
    }

    if (!selectedPermissions || selectedPermissions.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Permissão não seleccionada",
        text: "Por favor, seleccione pelo menos uma permissão de acesso.",
        confirmButtonColor: "#1e40af",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const confirmation = await Swal.fire({
      title: "Confirmar Registo",
      text: "Deseja criar este novo utilizador no sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, registar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1e40af",
      cancelButtonColor: "#64748b",
    });

    if (confirmation.isConfirmed) {
      const newUser = {
        ...userData,
        permissions: selectedPermissions,
      };

      try {
        setLoading(true);
        await createUser({
          ...newUser,
          password: "sebadora2024",
        });

        Swal.fire({
          icon: "success",
          title: "Utilizador Criado",
          text: "O registo do utilizador foi concluído com sucesso!",
          confirmButtonText: "OK",
          confirmButtonColor: "#059669",
        }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Erro ao Registar",
          text: "Não foi possível criar o utilizador. Verifique os dados e tente novamente.",
          confirmButtonText: "OK",
          confirmButtonColor: "#e11d48",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <PageHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              color: "#1e40af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            <FaUserPlus />
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontWeight: 800,
                color: "#0f172a",
                fontSize: "1.2rem",
              }}
            >
              Registo e Governação de Utilizadores
            </h4>
            <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "0.84rem" }}>
              Configure credenciais institucionais, perfil de acesso e permissões por módulo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadPermissions}
          className="btn btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <MdOutlineRefresh size={17} />
          Actualizar Permissões
        </button>
      </PageHeader>

      <SectionCard>
        <SectionHeader>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
            1. Dados de Identificação do Utilizador
          </span>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Todos os campos são de preenchimento obrigatório
          </span>
        </SectionHeader>

        <div style={{ padding: "1.5rem" }}>
          <div className="row g-3">
            <div className="col-md-4 mb-3">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                name="name"
                placeholder="Ex.: João Manuel"
                value={userData.name}
                onChange={handleUserDataChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                name="birthDate"
                value={userData.birthDate}
                onChange={handleUserDataChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Contacto Telefónico</label>
              <input
                type="text"
                name="phone"
                placeholder="+258 84 000 0000"
                value={userData.phone}
                onChange={handleUserDataChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4 mb-2">
              <label className="form-label">Perfil Institucional</label>
              <select
                name="profile"
                value={userData.profile}
                onChange={handleUserDataChange}
                className="form-select"
                required
              >
                <option value="">Seleccione um perfil...</option>
                <option value="1">Adido Financeiro</option>
                <option value="2">Chefe da Missão</option>
                <option value="3">Assistente Financeiro</option>
                <option value="4">Embaixador</option>
              </select>
            </div>

            <div className="col-md-8 mb-2">
              <label className="form-label">Endereço de E-mail Institucional</label>
              <input
                type="email"
                name="email"
                placeholder="utilizador@instituicao.gov.mz"
                value={userData.email}
                onChange={handleUserDataChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
            2. Matriz de Permissões por Módulo
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#1e40af",
              backgroundColor: "#eff6ff",
              padding: "3px 10px",
              borderRadius: "9999px",
            }}
          >
            {selectedPermissions.length} permissões seleccionadas
          </span>
        </SectionHeader>

        <div style={{ padding: "1.5rem" }}>
          <div className="row">
            {permissions
              .filter(
                (section) =>
                  section.name !== "Dashboard" &&
                  section.name !== "Reconciliação Bancária"
              )
              .map((section) => {
                if (section.parentId === null) {
                  return (
                    <div key={section.id} className="col-md-4 mb-3">
                      <PermissionGroupCard>
                        <PermissionGroupHeader>
                          <FaShieldAlt style={{ color: "#1e40af" }} />
                          <span>{section.name}</span>
                        </PermissionGroupHeader>
                        <div style={{ padding: "0.9rem 1rem" }}>
                          {permissions
                            .filter(
                              (child) =>
                                child.parentId === section.id &&
                                child.visibility === 1
                            )
                            .map((child) => (
                              <div
                                key={child.id}
                                className="form-check"
                                style={{
                                  marginBottom: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id={`perm-${child.id}`}
                                  className="form-check-input"
                                  style={{ cursor: "pointer", marginTop: 0 }}
                                  checked={selectedPermissions.includes(child.id)}
                                  onChange={() => handleCheckboxChange(child.id)}
                                  disabled={child.visibility === 0}
                                />
                                <label
                                  htmlFor={`perm-${child.id}`}
                                  className="form-check-label"
                                  style={{
                                    cursor: "pointer",
                                    marginBottom: "0 !important",
                                    fontWeight: 500,
                                    color: "#334155",
                                  }}
                                >
                                  {child.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </PermissionGroupCard>
                    </div>
                  );
                }
                return null;
              })}
          </div>
        </div>

        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ minWidth: "200px", padding: "10px 24px" }}
          >
            Criar Utilizador
          </button>
        </div>
      </SectionCard>

      <Spinner isLoading={loading} />
    </div>
  );
};

export default UserRegister;
