import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import MaintainSubjects from "./Subjects/MaintainSubjects";
import MaintainClassRoom from "./Classes/MaintainClass";

import BugReport from "@material-ui/icons/BugReport";
import Cloud from "@material-ui/icons/Cloud";

import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);


/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Index({ setActiveStepButtons, childToParent, parentData }) {

  //Disable parent stepers buttons
  setActiveStepButtons(false);

  const formClasses = formStyles();
  const formControlClasses = formControllLabelStyles();

  return (
    <>
      <CustomTabs
        title="Manter ano lectivo :"
        headerColor="rose"
        tabs={[
          {
            tabName: "Configurar Classes",
            tabIcon: BugReport,
            tabContent: (
              <MaintainSubjects childToParent={childToParent} parentData={parentData}
              />
            ),
          },

          {
            tabName: "Configurar Turmas",
            tabIcon: Cloud,
            tabContent: (
              <MaintainClassRoom childToParent={childToParent} parentData={parentData}
              />
            ),
          },
        ]}
      />
    </>
  );
}
