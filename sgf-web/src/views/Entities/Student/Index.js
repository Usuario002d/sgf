import React from "react";
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent";
import Settings from "./Settings";
import Maintain from "./Maintain/Index";
import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles";
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility";
import { configTableDummyDate } from "variables/generalTestDummyData.js";

const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar', 'Criar/Actualizar', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ["fullName"]
    case 2: return []
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
  const [studentsData, setStudentDatas] = React.useState([]);
  const [studentData, setStudentData] = React.useState({ father: {}, mother: {}, sponsors: [], });
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");
  const [controllState, setControllState] = React.useState(0);

  const title = "Manter Aluno";
  const subtitle = "Fluxo de Manuntenção de Alunos";

  const documentsTypes = configTableDummyDate.filter(field => field.type === "documentType");
  const kinshipTypes = configTableDummyDate.filter(field => field.type === "kinshipType");

  React.useEffect(() => {
    if (controllState === 0) {
      // setStudentsData(configTableDummyDate)
      setControllState(1);
      console.log("Control useEffect to run once")
    }
  }, [controllState]);


  /*FormDate to be created on steps as childDate*/
  const createChildDateToParent = (childdata) => {
    setStudentData(childdata.dto);
    setErrors(childdata.errors);
  }

  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setStudentData(childdata.dto);
    setAction(childdata.action);
    setActiveStep(childdata.step);
    handleNext();
  }

  /*Filtered dtos to be mounted on parent form*/
  const seachChildDateToParent = (seachableField, inputFilterValue) => {
    let tempRows = studentData;
    let filteredRows = tempRows.filter(field => field[seachableField] === inputFilterValue);
    return filteredRows;
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings
          editChildDateToParent={editChildDateToParent}
          seachChildDateToParent={seachChildDateToParent}
          parentData={{ title: title, subtitle: subtitle, activeStep: activeStep, dtos: studentsData }} />;
      case 1:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: studentData, documentsTypes: documentsTypes, requiredFields, errors, action }} />;
      case 2:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: studentData, documentsTypes: documentsTypes, requiredFields, errors, action }} />;
      case 3:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: studentData, documentsTypes: documentsTypes, kinshipTypes: kinshipTypes, requiredFields, errors, action }} />;
      case 4:
        return <Maintain parentData={{ activeStep, dto: studentData, requiredFields, errors, action }} />;
      case 5:
        return <Maintain parentData={{ activeStep, dto: studentData, action }} />;
      default:
        return 'Fluxo de manutencao de estudantes invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setStudentData({ father: {}, mother: {}, sponsor: {}, });
    setErrors({})
    setAction("CREATE");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = (e) => {
    /*--------- Validate all step except settings step=0 -------*/
    if (activeStep !== 0) {
      const requiredFields = getRequeredFields(activeStep);
      if (!hasRequiredData(studentData, requiredFields)) {
        let dataFields = Object.keys(studentData);
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

    /**------- Execute: Confirm Steper (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === steps.length - 1) {
      if (action === "CREATE") {
        let tempUser = studentData;
        tempUser.id = studentsData.length + 1;
        studentsData.push(tempUser);
        resteAction();
        console.log("New user added", tempUser);
      }
      if (action === "EDIT") {
        studentsData.map((value, index) => {
          if (value.id === studentData.id) {
            studentsData[index] = studentData
          }
        });
        resteAction();
        console.log("User edited", studentData);
      }

      if (action === "REMOVE") {
        studentsData.pop(studentData);
        resteAction();
        console.log("User removed", studentData);
      }
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
      <SteperFlowComponent activeStep={activeStep} steps={steps} />
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