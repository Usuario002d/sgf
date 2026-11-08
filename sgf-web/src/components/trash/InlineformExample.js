import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
// @material-ui/icons components

// core components
import componentStyles from "assets/theme/components/forms.js";

const useStyles = makeStyles(componentStyles);

function Example() {
  const classes = useStyles();
  const formClasses = {
    root: classes.formControlCheckboxLabelRoot,
    label: classes.formControlCheckboxLabelLabel,
  }
  return (
    <>
      <Box
        component={RadioGroup}
        aria-label="gender"
        name="example-radio"
        flexDirection="row!important"
      >
        <FormControlLabel
          control={<Radio color="primary" />}
          label="Toggle this custom radio"
          value="1"
          labelPlacement="end"
          classes={formClasses}
        />
        <FormControlLabel
          control={<Radio color="primary" />}
          label="Or toggle this other custom radio"
          labelPlacement="end"
          value="2"
          classes={formClasses}
        />
      </Box>
    </>
  );
}

export default Example;