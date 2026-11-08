import React from "react";
import PropTypes from "prop-types";

// @material-ui/compnents
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableHead from '@material-ui/core/TableHead';
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from "@material-ui/core/Box";

// compnents
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

// @material-ui/icons
import Edit from "@material-ui/icons/Edit";
import Restore from "@material-ui/icons/Done";
import Remove from "@material-ui/icons/Close";
import Search from "@material-ui/icons/Search";


//Styles
import { makeStyles } from "@material-ui/core/styles";
import { FormHeaderClass, FormTableClass, FormControlSeachLabelClasses } from "./Styles"

const useFormTableStyles = makeStyles(FormTableClass);
const useFormHeaderStyles = makeStyles(FormHeaderClass);
const useFormControlStyles = makeStyles(FormControlSeachLabelClasses);


/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Settings({ childToParent, parentData }) {
  const headerClasses = useFormHeaderStyles();
  const tableClasses = useFormTableStyles();
  const formControlClasses = useFormControlStyles();

  const [seachFilter, setSeachFilter] = React.useState([]);
  const { title, subtitle, dtos: schoolsData } = parentData;

  const handleChangeSelect = (event, index, value) => setSeachFilter({ value });

  const handleOnClickSeach = async (e) => {
    console.log("OnClickSeach ", "teste");
  };

  const handleOnClickEdit = async (index, data) => {
    /*------- Update parent Data -----------*/
    let childData = { dto: data, step: parentData.activeStep, action: "EDIT" };
    childToParent(childData);
    console.log("Edit", childData);
    /*----------------------------------------*/
  };

  const handleOnClickRemove = (index, data) => {
    /*------- Update parent Data -----------*/
    let firstParentStepForRemoveForm = parentData.activeStep + 1;
    let childData = { dto: data, step: firstParentStepForRemoveForm, action: "REMOVE" };
    childToParent(childData);
    console.log("Remove", childData);
    /*----------------------------------------*/
  };

  const handleOnClickRestore = (index, data) => {
    /*------- Update parent Data -----------*/
    let firstParentStepForRestorForm = parentData.activeStep + 1;
    let childData = { dto: data, step: firstParentStepForRestorForm, action: "ACTIVE" };
    childToParent(childData);
    console.log("Restore", childData);
    /*----------------------------------------*/
  };

  const renderRemoveOrRestoreAction = (index, data) => {
    return data.state === 1 ?
      <Tooltip
        id="tooltip-top-start"
        title="Remover"
        placement="top"
        classes={{ tooltip: tableClasses.tooltip }}
      >
        <IconButton
          aria-label="Close"
          className={tableClasses.tableActionButton}
          onClick={() => handleOnClickRemove(index, data)}
        >
          <Remove
            className={
              tableClasses.tableActionButtonIcon + " " + tableClasses.remove
            }
          />
        </IconButton>
      </Tooltip>
      :
      <Tooltip
        id="tooltip-top-start"
        title="Restore"
        placement="top"
        classes={{ tooltip: tableClasses.tooltip }}
      >
        <IconButton
          aria-label="Restore"
          className={tableClasses.tableActionButton}
          onClick={() => handleOnClickRestore(index, data)}
        >
          <Restore
            className={
              tableClasses.tableActionButtonIcon + " " + tableClasses.restore
            }
          />
        </IconButton>
      </Tooltip>
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={headerClasses.cardTitle}>{title}</h4>
            <p className={headerClasses.cardCategory}>{subtitle}</p>
          </CardHeader>
          <CardBody>

            <Box display="flex" alignItems="center"
              justifyContent="center" style={{ paddingBottom: "15px" }}>
              <FormControlLabel
                label={<Typography >Pesquisar: </Typography>}
                labelPlacement="start"
                classes={formControlClasses}
                control={
                  <SelectField
                    onChange={handleChangeSelect}
                    classes={{ root: formControlClasses.selectField }}
                    variant="outlined"
                  >
                    <MenuItem value={1}>Nome</MenuItem>
                    <MenuItem value={2}>Estado</MenuItem>
                  </SelectField>
                }
              />
              <OutlinedInput key="search" name="search" autoComplete="none" color="primary"
                classes={{ input: formControlClasses.input, }}
              />

              <Button
                color="white" aria-label="edit" justIcon round
                classes={{ root: formControlClasses.seachButton }}
                onClick={handleOnClickSeach}
              >
                <Search />
              </Button>
            </Box>

            <Table
              className={{ root: tableClasses.table }}>
              <TableHead>
                <TableRow>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} >#</TableCell>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} >Codico</TableCell>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} >Nome</TableCell>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} >Endereço</TableCell>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} align="right">Estado</TableCell>
                  <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} align="right">Accoes</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {schoolsData.map((value, index) => (
                  <TableRow key={index} className={tableClasses.tableRow}>
                    <TableCell className={tableClasses.tableCellRoot}> {index + 1}</TableCell>
                    <TableCell className={tableClasses.tableCellRoot}>{value.code}</TableCell>
                    <TableCell className={tableClasses.tableCellRoot}>{value.name}</TableCell>
                    <TableCell className={tableClasses.tableCellRoot}>{value.address}</TableCell>
                    <TableCell align="right" size="small" className={tableClasses.tableCellRoot}>
                      <Box paddingTop="0.35rem" paddingBottom="0.35rem">
                        <Box
                          marginRight="20px"
                          component="i"
                          width="0.375rem"
                          height="0.375rem"
                          borderRadius="50%"
                          display="inline-block"
                          className={value.state === 1 ? tableClasses.tableCellActive : tableClasses.tableCellInactive}
                        >
                        </Box>
                        {value.state === 1 ? "Activo" : "Inactivo"}
                      </Box>
                    </TableCell>
                    <TableCell align="right" size="small" className={tableClasses.tableCellRoot}>
                      <Tooltip
                        id="tooltip-top"
                        title="Editar"
                        placement="top"
                        classes={{ tooltip: tableClasses.tooltip }}
                      >
                        <IconButton
                          aria-label="Edit"
                          className={tableClasses.tableActionButton}
                          onClick={() => handleOnClickEdit(index, value)}
                        >
                          <Edit
                            className={
                              tableClasses.tableActionButtonIcon + " " + tableClasses.edit
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      {renderRemoveOrRestoreAction(index, value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}