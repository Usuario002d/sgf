import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CreateFormStep1 from "../User/CreateFormStep1"

import TextField from "@material-ui/core/TextField";




const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
  },
  cardBody: {
    maxWidth: '0%',
  },
};


const useStyles = makeStyles(styles);

export default function Create({ parentToChild, childToParent }) {
  const classes = useStyles();

  const [data, setData] = React.useState("This is data from Child Component to the Parent Component.");

  const handleInputValue = (e) => {
    let { name, value } = e.target;
    //update input field value on form
    //validad form values
    validateForm();
  };

  const validateForm = () => {
    setData();
    childToParent(data.formFields);
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Criar Utilizadores</h4>
              <p className={classes.cardCategoryWhite}>Fluxo de Criação de utilizadores</p>
            </CardHeader>
            <CardBody >
              <TextField
                name="profile" autoComplete="none" color="primary"
                margin="dense"
                variant="outlined"
                onBlur={handleInputValue}
                onChange={handleInputValue}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}