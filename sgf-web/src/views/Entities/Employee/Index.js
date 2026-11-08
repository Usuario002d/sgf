import React from "react";
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent"
//Forms steppers
import Maintain from "./Maintain/Index";
import Settings from "./Settings";
//Styles
import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles"
//Utilities and variables
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility.js"
import { configTableDummyDate } from "variables/generalTestDummyData.js";


const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar - Passo1', 'Criar/Actualizar - Passo2', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['firstName', 'lastName', 'birthDate', 'docNumber', 'nuit']
    case 2: return ['academicLevel', 'email', 'cellphone1', 'address']
    default: return [];
  }
}

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Index() {
  const formClasses = formStyles();
  const steps = getSteps();

  const [activeStep, setActiveStep] = React.useState(0);
  const [employeeData, setEmployeeData] = React.useState({});
  const [employeesData, setEmployeesData] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");

  const title = "Manter Funcionario";
  const subtitle = "Fluxo de Manuntenção de Funcionarios";

  const academicLevels = configTableDummyDate.filter(field => field.type === "academicLevel");
  const employeeRoles = configTableDummyDate.filter(field => field.type === "employeeRole");


  React.useEffect(() => {
    //setEmployeesData([])
    // setAcademicLevel(academics);
    console.log(academicLevels);
  });


  /*FormDate to be created on steps as childDate*/
  const createChildDateToParent = (childdata) => {
    setEmployeeData(childdata.dto);
    setErrors(childdata.errors);
  }

  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setEmployeeData(childdata.dto);
    setAction(childdata.action);
    setActiveStep(childdata.step);
    handleNext();
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings childToParent={editChildDateToParent} parentData={{ title: title, subtitle: subtitle, activeStep, dtos: employeesData }} />;
      case 1:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: employeeData, academicLevels: academicLevels, employeeRoles: employeeRoles, requiredFields, errors, action }} />;
      case 2:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: employeeData, academicLevels: academicLevels, employeeRoles: employeeRoles, requiredFields, errors, action }} />;
      case 3:
        return <Maintain parentData={{ activeStep, dto: employeeData, requiredFields, errors, action }} />;
      case 4:
        return <Maintain parentData={{ activeStep, dto: employeeData, action }} />;

      default:
        return 'Fluxo de manutencao de funcionario invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setEmployeeData({});
    setErrors({})
    setAction("CREATE");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = () => {
    /*--------- Validate all step except settings step=0 -------*/
    if (activeStep !== 0) {
      const requiredFields = getRequeredFields(activeStep);
      if (!hasRequiredData(employeeData, requiredFields)) {
        let dataFields = Object.keys(employeeData);
        setErrors(["Preencha os campos obrigatorios: " +
          Object.values(requiredFields).filter(field => !dataFields.includes(field)).join()]);
        return;
      }
      let hasErrors = hasAnyValidFieldValue(errors);
      if (hasErrors) {
        return;
      }
    }
    /*---------------------------------------------------*/

    /**------- Execute (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === 2) {

      if (action === "CREATE") {
        let tempUser = employeeData;
        tempUser.id = employeesData.length + 1;
        employeesData.push(tempUser);
        resteAction();
        console.log("New user added", tempUser);
      }
      if (action === "EDIT") {
        employeesData.map((value, index) => {
          if (value.id === employeeData.id) {
            employeesData[index] = employeeData
          }
        });
        resteAction();
        console.log("User edited", employeeData);
      }

      if (action === "REMOVE") {
        employeesData.pop(employeeData);
        resteAction();
        console.log("User removed", employeeData);
      }
      // console.log("Is array: " + Array.isArray(errors));
    }
    /**------------------------------------------------------------------------**/
    /*----------------------------- Forward next step --------------------------*/
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    /**------------------------------------------------------------------------ */
  };

  const resteAction = () => {
    setAction("CREATE");
  }

  return (
    <div className={formClasses.root}>
      <SteperFlowComponent activeStep={activeStep} steps={steps} icons={1} />
      <div>
        <div>
          {stepContent(activeStep)}
          <div>
            {(activeStep !== 0) && (activeStep !== steps.length) && (action !== "REMOVER" || action !== "RESTORE") ?
              <>
                <Button variant="contained"
                  onClick={handleBack} className={formClasses.button}>
                  Voltar
                </Button>
              </>
              : <></>
            }
            <Button
              variant="contained" className={formClasses.button}
              onClick={activeStep !== steps.length ? handleNext : handleReset}
            >
              {activeStep === steps.length ? "Novo fluxo" : activeStep === 0 ? 'Adicionar Novo' : activeStep === steps.length - 1 ? 'Confirmar' : 'Proximo'}
            </Button>

            {(activeStep !== 0) && (activeStep !== steps.length) ?
              <>
                <Button variant="contained"
                  onClick={handleReset} className={formClasses.button}>
                  Cancelar
              </Button>
              </>
              : <></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}