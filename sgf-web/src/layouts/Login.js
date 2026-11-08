import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../services/authService";
import { makeStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import VerifiedUserOutlinedIcon from "@material-ui/icons/VerifiedUserOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";
import Spinner from "../config/spinner/spinner.js";
import Logo from "../assets/img/brasao.png";
import axios from "axios";
import config from "../../src/config/apiConfig.js";
import {
  fetchUserMenus,
  fetchFiscalYearsOverview,
  syncActiveFiscalYearWithBackend,
  getActiveFiscalYear,
} from "../services/accountService";
import { loginSuccess } from "../redux/auth/authSlice";
import { useDispatch } from "react-redux";


const useStyles = makeStyles((theme) => ({
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    backgroundColor: "#eef3f0",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  brandPanel: {
    flex: "0 0 46%",
    background: "linear-gradient(155deg, #0b221b 0%, #0f3d2e 55%, #14533c 100%)",
    color: "#ffffff",
    padding: "56px 64px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  brandTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  emblemBox: {
    width: "92px",
    height: "82px",
    borderRadius: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    border: "2px solid rgba(217, 119, 6, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
  },
  emblemImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: "scale(1.05)",
  },
  brandBadgeText: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#93c5fd",
  },
  heroContent: {
    maxWidth: "460px",
    margin: "auto 0",
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: "2.25rem",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.2,
    letterSpacing: "-0.025em",
    marginBottom: "18px",
  },
  heroSubtitle: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: 1.65,
    marginBottom: "32px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.9rem",
    color: "#e2e8f0",
    fontWeight: 500,
  },
  featureDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    flexShrink: 0,
  },
  brandFooter: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "20px",
  },
  formPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px 24px",
    backgroundColor: "#ffffff",
  },
  formContainer: {
    width: "100%",
    maxWidth: "440px",
  },
  mobileLogoHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  logoMain: {
    width: "auto",
    height: "145px",
    maxWidth: "280px",
    objectFit: "contain",
    marginBottom: "16px",
    filter: "drop-shadow(0 4px 14px rgba(0, 0, 0, 0.12))",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.03)",
    },
  },
  formTitle: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: "6px",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: "0.9rem",
    color: "#64748b",
    textAlign: "center",
    marginBottom: "24px",
  },
  securityNotice: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "11px 14px",
    marginBottom: "24px",
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: 500,
  },
  fieldGroup: {
    marginBottom: "18px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "6px",
  },
  outlinedInput: {
    backgroundColor: "#ffffff",
    borderRadius: "9px",
    fontSize: "0.92rem",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cbd5e1",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#94a3b8",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e40af",
      borderWidth: "1.5px",
    },
  },
  submitButton: {
    width: "100%",
    marginTop: "10px",
    padding: "12px 20px",
    backgroundColor: "#0f5132",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15, 81, 50, 0.22)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#0a3622",
      boxShadow: "0 6px 16px rgba(15, 81, 50, 0.3)",
    },
    "&:disabled": {
      backgroundColor: "#94a3b8",
      cursor: "not-allowed",
      boxShadow: "none",
    },
  },
  copyright: {
    marginTop: "24px",
    fontSize: "0.78rem",
    color: "#64748b",
    textAlign: "center",
  },
}));

export default function LoginPage() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const currentCalendarYear = new Date().getFullYear();

  const [step, setStep] = useState(1); // 1: Credenciais, 2: Selecção do Exercício Económico
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [formFields, setFormFields] = useState({ username: "", password: "" });
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [fiscalYearsList, setFiscalYearsList] = useState(() => {
    return [2026, 2025]
      .filter((y) => y >= 2025 && y <= currentCalendarYear)
      .map((y) => ({
        year: y,
        description: y === 2025 ? "Exercício 2025 (Ano de Lançamento)" : `Exercício Económico ${y}`,
        isLaunchYear: y === 2025,
        isConformed: y === 2025,
        isActive: y === 2025,
      }));
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.zoom = "100%";
    document.body.style.overflow = "auto";
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = Logo;

    fetchFiscalYearsOverview().then((list) => {
      const filtered = [
        {
          year: 2026,
          description: "Exercício Económico 2026",
          isLaunchYear: true,
          isConformed: false,
          isActive: true,
        },
      ];
      setFiscalYearsList(filtered);
      setFiscalYear("2026");
      localStorage.setItem("selectedFiscalYear", "2026");
    });
  }, [currentCalendarYear]);

  const normalizePermissions = (userData) => ({
    disponivel: userData.disponivel || false,
    reconBancaria: userData.reconBancaria || false,
    planoOrcamento: userData.planoOrcamento || false,
    requisoesFundos: userData.requisoesFundos || false,
    relatoriosGlobais: userData.relatoriosGlobais || false,
    contasReceberPagar: userData.contasReceberPagar || false,
  });

  const validateForm = () => {
    const tempErrors = {};
    if (!formFields.username) tempErrors.username = "Campo obrigatório.";
    if (!formFields.password) tempErrors.password = "Campo obrigatório.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputValue = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const fetchUserData = async (token) => {
    const response = await axios.get(`${config.BASE_URL}/sgf-api/user/getUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data.user;
    const normalizedPermissions = normalizePermissions(userData.permissions || {});

    const completeUserData = {
      ...userData,
      permissions: normalizedPermissions,
      isAdmin: userData.isAdmin || false,
    };

    localStorage.setItem("userData", JSON.stringify(completeUserData));
    return completeUserData;
  };

  // Passo 1: Validação das Credenciais de Acesso
  const handleLoginCredentials = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        title: "Campos Obrigatórios",
        text: "Por favor, preencha o utilizador e a palavra-passe.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#0f5132",
      });
      return;
    }

    setLoading(true);
    try {
      const loginResponse = await login(formFields.username, formFields.password);
      const token = loginResponse.value;
      localStorage.setItem("authToken", token);

      const userData = await fetchUserData(token);
      setAuthenticatedUser({ userData, token });

      // Avança para o Passo 2: Selecção do Exercício Económico
      setStep(2);
    } catch (error) {
      let errorMessage = "Não foi possível autenticar. Verifique a ligação e tente novamente.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Credenciais inválidas. Verifique o seu e-mail e palavra-passe.";
        } else if (error.response.status === 403) {
          errorMessage = "Acesso negado. A sua conta pode encontrar-se inactiva.";
        }
      }

      Swal.fire({
        title: "Falha na Autenticação",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Tentar Novamente",
        confirmButtonColor: "#0f5132",
      });
    } finally {
      setLoading(false);
    }
  };

  // Passo 2: Confirmação do Exercício Económico e Entrada no Sistema
  const handleConfirmFiscalYear = async (e) => {
    e.preventDefault();
    if (!authenticatedUser) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const { userData, token } = authenticatedUser;

      // Activar o Exercício Económico / Ano Fiscal selecionado na sessão e no servidor
      await syncActiveFiscalYearWithBackend(Number(fiscalYear));

      const userMenus = await fetchUserMenus(userData.id);
      localStorage.setItem("userMenus", JSON.stringify(userMenus));

      dispatch(
        loginSuccess({
          ...userData,
          token,
        })
      );

      history.push("/admin/dashboard");
    } catch (error) {
      Swal.fire({
        title: "Erro ao Carregar Exercício",
        text: error.message || "Não foi possível activar o exercício económico.",
        icon: "error",
        confirmButtonColor: "#0f5132",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.brandPanel}>
        <div className={classes.brandTop}>
          <div className={classes.emblemBox}>
            <img src={Logo} alt="Emblema" className={classes.emblemImg} />
          </div>
          <span className={classes.brandBadgeText}>
            Plataforma Institucional • SGF
          </span>
        </div>

        <div className={classes.heroContent}>
          <h1 className={classes.heroTitle}>
            Sistema Integrado de Gestão Financeira
          </h1>
          <p className={classes.heroSubtitle}>
            Monitorização rigorosa da execução orçamental, controlo de tesouraria,
            requisições de fundos e reconciliação bancária em tempo real.
          </p>

          <div className={classes.featureList}>
            <div className={classes.featureItem}>
              <span className={classes.featureDot} />
              Plano de Contas Orçamental e Financeiro Integrado
            </div>
            <div className={classes.featureItem}>
              <span className={classes.featureDot} />
              Conformidade de Requisições e Controlo de Dotação
            </div>
            <div className={classes.featureItem}>
              <span className={classes.featureDot} />
              Relatórios Executivos, Balancetes e Reconciliação Bancária
            </div>
          </div>
        </div>

        <div className={classes.brandFooter}>
          <span>Governação & Transparência Financeira</span>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      <div className={classes.formPanel}>
        {step === 1 ? (
          /* PASSO 1: CREDENCIAIS DE ACESSO */
          <form className={classes.formContainer} onSubmit={handleLoginCredentials}>
            <div className={classes.mobileLogoHeader}>
              <img src={Logo} alt="Logotipo SGF" className={classes.logoMain} />
              <h2 className={classes.formTitle}>Acesso ao Portal SGF</h2>
              <p className={classes.formSubtitle}>
                Introduza as suas credenciais institucionais para continuar
              </p>
            </div>

            <div className={classes.securityNotice}>
              <VerifiedUserOutlinedIcon style={{ color: "#0f5132", fontSize: 20 }} />
              <span>Ambiente seguro. Não partilhe as suas credenciais de acesso.</span>
            </div>

            <div className={classes.fieldGroup}>
              <label className={classes.fieldLabel}>E-mail ou Utilizador</label>
              <OutlinedInput
                name="username"
                placeholder="exemplo@sgf.com"
                fullWidth
                value={formFields.username}
                onChange={handleInputValue}
                error={!!errors.username}
                className={classes.outlinedInput}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineIcon style={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                }
              />
            </div>

            <div className={classes.fieldGroup}>
              <label className={classes.fieldLabel}>Palavra-passe</label>
              <OutlinedInput
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                fullWidth
                value={formFields.password}
                onChange={handleInputValue}
                error={!!errors.password}
                className={classes.outlinedInput}
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon style={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff style={{ fontSize: 19, color: "#64748b" }} />
                      ) : (
                        <Visibility style={{ fontSize: 19, color: "#64748b" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={classes.submitButton}
            >
              {loading ? "A autenticar..." : "Entrar"}
            </button>

            <Spinner isLoading={loading} />

            <div className={classes.copyright}>
              &copy; {new Date().getFullYear()} Sebadora • Todos os direitos reservados.
            </div>
          </form>
        ) : (
          /* PASSO 2: SELECÇÃO DO EXERCÍCIO ECONÓMICO / ANO FISCAL */
          <form className={classes.formContainer} onSubmit={handleConfirmFiscalYear}>
            <div className={classes.mobileLogoHeader}>
              <img src={Logo} alt="Logotipo SGF" className={classes.logoMain} />
              <h2 className={classes.formTitle}>Exercício Económico</h2>
              <p className={classes.formSubtitle}>
                Selecione o Ano Fiscal de trabalho para iniciar a sessão
              </p>
            </div>

            {/* Cartão de Confirmação do Utilizador Autenticado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                backgroundColor: "#eaf5ef",
                border: "1px solid #b7dec9",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#0f5132",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {authenticatedUser?.userData?.fullName?.[0] || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f2922" }}>
                  {authenticatedUser?.userData?.fullName || "Utilizador"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#5c746b" }}>
                  {authenticatedUser?.userData?.email || formFields.username}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0f5132",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Alterar
              </button>
            </div>

            <div className={classes.fieldGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className={classes.fieldLabel} style={{ marginBottom: 0 }}>
                  Ano Fiscal em Exercício
                </label>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#0f5132",
                    backgroundColor: "#eaf5ef",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px solid #b7dec9",
                  }}
                >
                  Contabilidade & Orçamento
                </span>
              </div>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <EventNoteOutlinedIcon
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "#0f5132",
                    fontSize: 22,
                    pointerEvents: "none",
                  }}
                />
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px 0 46px",
                    borderRadius: "10px",
                    border: "2px solid #b7dec9",
                    backgroundColor: "#f7fbf9",
                    color: "#0f2922",
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {fiscalYearsList.map((item) => (
                    <option key={item.year} value={String(item.year)}>
                      Exercício {item.year} {item.isConformed ? "• Orçamento Conforme" : item.budgetFinalAllocation > 0 ? "• Em Execução" : "• Exercício Económico Ativo"}
                    </option>
                  ))}
                </select>
              </div>

              <p style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "8px", lineHeight: 1.45 }}>
                Os relatórios, tabelas de despesas orçamentais e requisições de fundos serão carregados exclusivamente para o ano selecionado.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={classes.submitButton}
            >
              {loading ? "A carregar dados do exercício..." : `Entrar no Exercício ${fiscalYear}`}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "8px 14px",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "1px solid #d5e0da",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Voltar às Credenciais
            </button>

            <Spinner isLoading={loading} />

            <div className={classes.copyright}>
              &copy; {new Date().getFullYear()} Sebadora • Todos os direitos reservados.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
