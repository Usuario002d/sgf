import React from "react";
// @material-ui/compnents
import OutlinedInput from "@material-ui/core/OutlinedInput";
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from "@material-ui/core/Box";
// @material-ui/icons
import SearchIcon from "@material-ui/icons/Search";
import RestoreSeachIcon from "@material-ui/icons/Restore";

import { makeStyles } from "@material-ui/core/styles";
import { FormControlSeachLabelClasses } from "./Styles"

const useFormControlStyles = makeStyles(FormControlSeachLabelClasses);

//This is any example for guide us
const seachableFieldFiltresExamples = [
  { name: 'type', label: 'Tipo', seachable: true, filterDataType: "string" },
  { name: 'description', label: 'Descrição', seachable: true, filterDataType: "number" },
  {
    name: 'state', label: 'Estado', seachable: true,
    filterDataType: "array", filters: [{ label: "Activo", value: 1 }, { label: "Inactivo", value: 0 },],
  },
];

/**
 * Seach Components
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function SearchComponent({ seachableFieldsData, onClickSeach }) {
  const formControlClasses = useFormControlStyles();

  const [seachableField, setSeachableFieldFilter] = React.useState();
  const [inputFilterValue, setInputFilterValue] = React.useState();

  const handleChangeSelectFilter = (e) => {
    setSeachableFieldFilter(e.target.value);
  }

  const handleInputFilter = (e) => {
    setInputFilterValue(e.target.value);
  }

  const handleOnClickSeach = (e) => {
    onClickSeach(seachableField, inputFilterValue);
  };

  const handleOnClickResorSeach = (e) => {
    onClickSeach(seachableField, inputFilterValue);
  };

  return (
    <Box display="flex" alignItems="center"
      justifyContent="center" style={{ paddingBottom: "15px" }}>
      <FormControlLabel
        label={<Typography >Pesquisar: </Typography>}
        labelPlacement="start"
        classes={formControlClasses}
        control={
          <SelectField
            id="seachFilter"
            onChange={(e) => handleChangeSelectFilter(e)}
            classes={{ root: formControlClasses.selectField }}
            variant="outlined"
            value={seachableField}
          >
            {seachableFieldsData.map((field) => {
              return (field.seachable ? <MenuItem value={field.name}>{field.label}</MenuItem> : <></>)
            })}

          </SelectField>
        }
      />
      {seachableField ?
        seachableFieldsData.map((field) => {
          if (seachableField === field.name && field.seachable) {
            return (field.filterDataType === "string" ?
              <OutlinedInput key="search" name="search" autoComplete="none" color="primary"
                classes={{ input: formControlClasses.input, }}
                onChange={handleInputFilter}
                onBlur={handleInputFilter}
                value={inputFilterValue}
              /> : field.filterDataType === "array" ?
                <SelectField
                  id="search"
                  onChange={(e) => handleInputFilter(e)}
                  classes={{ root: formControlClasses.selectFieldLarge }}
                  variant="outlined"
                  value={inputFilterValue}
                >
                  {field.filters.map((filter) => {
                    return <MenuItem value={filter.value}>{filter.label}</MenuItem>
                  })}
                </SelectField> : <></>)
          }
        })
        : <Typography >Informe o filtro de pesquisa </Typography>}

      <Button
        color="white" aria-label="edit" justIcon round
        classes={{ root: formControlClasses.seachButton }}
        onClick={handleOnClickSeach}
      >
        <SearchIcon />       </Button>

      <Button
        color="white" aria-label="edit" justIcon round
        classes={{ root: formControlClasses.seachButton }}
        onClick={handleOnClickResorSeach}
      >
        <RestoreSeachIcon />
      </Button>


    </Box>
  );
}