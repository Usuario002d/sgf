import React from "react";
// @material-ui/compnents
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableHead from '@material-ui/core/TableHead';
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TablePagination from '@material-ui/core/TablePagination';
import TableContainer from '@material-ui/core/TableContainer';
import Box from "@material-ui/core/Box";
// @material-ui/icons
import Edit from "@material-ui/icons/Edit";
import Restore from "@material-ui/icons/Done";
import Remove from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/core/styles";
import { FormTableClass } from "./Styles"
import Chip from '@material-ui/core/Chip';


const useFormTableStyles = makeStyles(FormTableClass);
/**
 * ------ Table Component----
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function TableComponent({ columns, rows, defaultRowsPerPage, handleOnClickEdit, handleOnClickRemove, handleOnClickRestore }) {
  const tableClasses = useFormTableStyles();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage ? defaultRowsPerPage : 6);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value);
    setPage(0);
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
    <>
      <TableContainer>
        <Table
          className={{ root: tableClasses.table }}>
          <TableHead>
            <TableRow>
              <TableCell variant="head" classes={{ root: tableClasses.tableCellRootHead }} >#</TableCell>
              {columns.map((column) => (
                <TableCell
                  variant="head"
                  key={column.name}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  classes={{ root: tableClasses.tableCellRootHead }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {rows && rows.length !== 0 ?
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index} className={tableClasses.tableRow}>
                  <TableCell className={tableClasses.tableCellRoot}> {index + 1}</TableCell>
                  {columns.map((column) => {

                    let fieldName = column.name;
                    let rowColumnValue = row[column.name];
                    const fieldsNames = [...fieldName.split(".")];

                    if (fieldsNames.length > 1) {
                      let fieldAsObject = row[fieldsNames[0]];
                      fieldName = [fieldsNames[1]];
                      rowColumnValue = fieldAsObject[fieldName];
                    }

                    return (
                      <TableCell key={column.name} align={column.align} size={column.small}
                        className={tableClasses.tableCellRoot} >
                        {
                          column.name === "state" ?
                            (
                              <Box paddingTop="0.35rem" paddingBottom="0.35rem">
                                <Box
                                  marginRight="20px"
                                  component="i"
                                  width="0.375rem"
                                  height="0.375rem"
                                  borderRadius="50%"
                                  display="inline-block"
                                  className={row.state === 1 ? tableClasses.tableCellActive : tableClasses.tableCellInactive}
                                >
                                </Box>
                                {rowColumnValue === 1 ? "Activo" : "Inactivo"}
                              </Box>
                            ) : column.name === "action" ? (<>
                              <Tooltip
                                id="tooltip-top"
                                title="Editar"
                                placement="top"
                                classes={{ tooltip: tableClasses.tooltip }}
                              >
                                <IconButton
                                  aria-label="Edit"
                                  className={tableClasses.tableActionButton}
                                  onClick={() => handleOnClickEdit(index, row)}
                                >
                                  <Edit
                                    className={
                                      tableClasses.tableActionButtonIcon + " " + tableClasses.edit
                                    }
                                  />
                                </IconButton>
                              </Tooltip>
                              {renderRemoveOrRestoreAction(index, row)}
                            </>
                            ) :
                              //other columns
                              Array.isArray(rowColumnValue) ?
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {rowColumnValue.map((data) => (
                                    <Chip key={data.description} label={data.description} />
                                  ))}
                                </Box> :
                                (typeof rowColumnValue === 'number' || typeof rowColumnValue === 'string'
                                  ? rowColumnValue
                                  : "cannont render properties"
                                )
                        }
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
            : <> </>
          }
        </Table>
      </TableContainer>
      {rows && rows.length !== 0 ?
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(e, page) => handleChangePage(e, page)}
          onChangeRowsPerPage={(e) => handleChangeRowsPerPage(e)}
        /> : <></>}
    </>
  );
}