export const hasAnyInvalidFieldValue = (data) => {

    let emptyData = !Object.values(data).length;

    if (emptyData) return false;

    Object.values(data).map(value => {
        if (!value) return true;
    })
    return false;
}

export const hasAllValidFieldValue = (data) => {
    let isValidValue = true;
    Object.values(data).map(value => {
        isValidValue = value ? true : false;
        if (!isValidValue) return;
    })
    return isInvalidValue;
}

export const hasAnyValidFieldValue = (data) => {
    let isValidValue = false;
    Object.values(data).map(value => {
        isValidValue = value ? true : false;
        if (isValidValue) return;
    })
    return isValidValue;
}

export const hasEmpyData = (data) => {
    let emptyData = !Object.values(data).length;
    return emptyData ? true : false;
}

/**Check if Data was filled*/
export const hasRequiredData = (data, requiredFields) => {
    let emptyData = !Object.keys(data).length;
    if (emptyData) {
        return false;
    }
    if (Object.values(requiredFields).length > Object.keys(data).length) {
        return false;
    }

    if (!hasValidRequiredData(data, requiredFields)) {
        return false;
    }

    return true;
}

/**Check if Data was filled*/
export const hasValidRequiredData = (data, requiredFields) => {
    //Validate is data is not completed filled
    let isValidData = true;
    requiredFields.forEach(field => {
        if (field in data) {
            isValidData = data[field] ? true : false;
            if (!isValidData) return;
        } else {
            isValidData = false;
            return;
        }
    });
    return isValidData;
}