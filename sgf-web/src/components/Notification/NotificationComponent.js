
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { hasAnyValidFieldValue} from "utilities/ObjectUtility.js";

export const ErrorNotification = (errors) => {
    let hasErrors = hasAnyValidFieldValue(errors);
    /*
    Object.values(errors).map(value => {
        if (value) { hasErrors = true; return };
    })
    */
    return hasErrors ? <SnackbarContent message={Object.values(errors).join()
    } color="danger" /> : <></>
}

export const SuccessNotification = () => {
    return <SnackbarContent message={"Operacao realizada com sucesso"} color="success" />
}
