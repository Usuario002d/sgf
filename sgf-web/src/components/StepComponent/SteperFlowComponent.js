import { makeStyles, withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepConnector from '@material-ui/core/StepConnector';
import StepIcon from './SteperFlowIconComponent';
import React from "react";

const StepConnectorColor = withStyles({
  alternativeLabel: {
    top: 22,
  },
  active: {
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  completed: {
    '& $line': {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
})(StepConnector);


const indexStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const steperStyles = makeStyles((theme) => ({
  root: {
    height: '40px',
  }
}));

export default function StepFlowComponent(props) {
  const classes = indexStyles();
  const steperClasses = steperStyles();

  const { activeStep, steps } = props;

  return (
    <div className={classes.root}>
      <Stepper className={steperClasses.root} alternativeLabel activeStep={activeStep} connector={<StepConnectorColor />}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

StepFlowComponent.StepFlowComponent = {
  activeStep: PropTypes.int,
  StepIcon: PropTypes.int,
 // StepIcon: PropTypes.node,
};