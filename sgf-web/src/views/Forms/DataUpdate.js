import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createUser, fetchPermissions } from "services/accountService";
import Spinner from "../../config/spinner/spinner";
import { FaUserEdit, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { MdOutlineRefresh } from "react-icons/md";

const DataUpdate = () => {
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

  const fetchUserPermissions = async () => {
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
    fetchUserPermissions();
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
        text: "Por favor, preencha todos os campos obrigatórios.",
      });
      return false;
    }

    if (!selectedPermissions || selectedPermissions.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Permissão não seleccionada",
        text: "Por favor, seleccione pelo menos uma permissão.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const confirmation = await Swal.fire({
      title: "Confirmar Actualização",
      text: "Deseja guardar os dados e permissões deste utilizador?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, actualizar!",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f5132",
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
          title: "Sucesso!",
          text: "Dados do utilizador actualizados com sucesso!",
          confirmButtonText: "OK",
          confirmButtonColor: "#0f5132",
        }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Erro ao actualizar o utilizador! Tente novamente.",
          confirmButtonText: "OK",
          confirmButtonColor: "#be123c",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid py-2">
      <Spinner isLoading={loading} />

      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Actualização de Dados e Permissões de Utilizador
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            <FaUserEdit className="me-1" /> Administração
          </span>
        </div>

        <button
          type="button"
          onClick={fetchUserPermissions}
          className="btn btn-secondary btn-sm"
        >
          <MdOutlineRefresh size={16} /> Actualizar Permissões
        </button>
      </div>

      {/* Card 1: Dados do Utilizador */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaUserEdit style={{ color: "#0f5132" }} />
            <span>1. Dados do Utilizador</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
            Preencha os dados institucionais a actualizar
          </span>
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleUserDataChange}
                className="form-control"
                placeholder="Nome completo do colaborador"
                required
              />
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
              <label className="form-label">Telemóvel</label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleUserDataChange}
                className="form-control"
                placeholder="+258 84 000 0000"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Perfil Institucional</label>
              <select
                name="profile"
                value={userData.profile}
                onChange={handleUserDataChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="1">Adido Financeiro</option>
                <option value="2">Chefe da Missão</option>
                <option value="3">Assistente</option>
                <option value="4">Embaixador</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">E-mail Institucional</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserDataChange}
                className="form-control"
                placeholder="utilizador@instituicao.gov.mz"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Permissões */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaShieldAlt style={{ color: "#0f5132" }} />
            <span>2. Matriz de Permissões por Módulo</span>
          </div>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            {selectedPermissions.length} seleccionadas
          </span>
        </div>
        <div className="card-body">
          <div className="row g-2">
            {permissions
              .filter(
                (section) =>
                  section.name !== "Dashboard" &&
                  section.name !== "Reconciliação Bancária"
              )
              .map((section) => {
                if (section.parentId === null) {
                  return (
                    <div key={section.id} className="col-md-4">
                      <div
                        className="h-100 rounded border"
                        style={{ backgroundColor: "#f8fbf9", borderColor: "#d5e0da" }}
                      >
                        <div
                          className="px-3 py-2 border-bottom fw-bold"
                          style={{
                            backgroundColor: "#eaf5ef",
                            color: "#0f5132",
                            fontSize: "0.82rem",
                          }}
                        >
                          {section.name}
                        </div>
                        <div className="p-2 px-3">
                          {permissions
                            .filter(
                              (child) =>
                                child.parentId === section.id &&
                                child.visibility === 1
                            )
                            .map((child) => (
                              <div key={child.id} className="form-check my-1">
                                <input
                                  type="checkbox"
                                  id={`upd-${child.id}`}
                                  className="form-check-input"
                                  checked={selectedPermissions.includes(child.id)}
                                  onChange={() => handleCheckboxChange(child.id)}
                                  disabled={child.visibility === 0}
                                />
                                <label
                                  htmlFor={`upd-${child.id}`}
                                  className="form-check-label"
                                  style={{ fontSize: "0.8rem", fontWeight: 500 }}
                                >
                                  {child.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            <FaCheckCircle /> Actualizar Utilizador
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataUpdate;
