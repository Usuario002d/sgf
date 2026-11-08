import React from "react";
// @material-ui/core components
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
// @material-ui/icons components

// core components

function Example() {
    return (
        <>
            <FormGroup>
                <FormLabel>Email address</FormLabel>
                <OutlinedInput fullWidth type="email" placeholder="Default input" />
            </FormGroup>
            <FormGroup>
                <FormLabel>Example select</FormLabel>
                <FormControl variant="outlined" fullWidth>
                    <Select>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                    </Select>
                </FormControl>
            </FormGroup>
            <FormGroup>
                <FormLabel>Example multiple select</FormLabel>
                <FormControl variant="outlined" fullWidth>
                    <Select multiple defaultValue={[]}>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                    </Select>
                </FormControl>
            </FormGroup>
            <FormGroup>
                <FormLabel>Example textarea</FormLabel>
                <OutlinedInput fullWidth multiline rows="4" />
            </FormGroup>
        </>
    );
}

export default Example;
