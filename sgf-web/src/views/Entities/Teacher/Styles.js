import {
    defaultFont,
    primaryColor,
    dangerColor,
    successColor,
    grayColor,
} from "assets/jss/material-dashboard-react.js";
import tooltipStyle from "assets/jss/material-dashboard-react/tooltipStyle.js";
import checkboxAdnRadioStyle from "assets/jss/material-dashboard-react/checkboxAdnRadioStyle.js";

export const FormHeaderClass = {
    cardCategory: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "15px",
        marginTop: "0",
        marginBottom: "0",
    },
    cardTitle: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "400",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none",
    },
    cardBody: {
        maxWidth: '0%',
    },
};

export const FormClasses = (theme) =>
    ({
        paper: {
            maxWidth: '100%'
        },

        root: {
            width: '100%'
        },

        button: {
            marginRight: theme.spacing(1),
            background: "#bc4c47",
            color: "white",
        },

        nested: {
            paddingLeft: theme.spacing(4)
        },

        searchWrapper: {
            [theme.breakpoints.down("sm")]: {
                width: "-webkit-fill-available",
                margin: "10px 15px 0",
            },
            display: "inline-block",
        },

        flex: {
            flex: 1,
        },

        inLineBlock: {
            display: "inline-block",
            width: "100px",
            height: "100px",
            padding: "5px",
        }
    })

export const FormControlLabelClasses = (theme) =>
    ({
        root: {
            maxWidth: '100%',
            display: "flex",
            justifyContent: "space-between",
        },

        input: {
            paddingTop: 10,
            paddingBottom: 10,
            borderColor: theme.palette.background.default,
            backgroundColor: theme.palette.background.default,
            width: 600,
        },

        label: {
            paddingRight: theme.spacing(20),
            width: 100,
            fontWeight: "400",
            color: 'black',
        },

        nested: {
            paddingLeft: theme.spacing(4)
        },

        inLineBlock: {
            display: "inline-block",
            padding: theme.spacing(60),
            paddingLeft: theme.spacing(4)
        },
    })

export const FormControlSeachLabelClasses = (theme) =>
    ({
        root: {
            maxWidth: '30%',
            paddingRight: theme.spacing(4),
        },
        input: {
            paddingTop: 10,
            paddingBottom: 10,
            borderColor: theme.palette.background.default,
            backgroundColor: theme.palette.background.default,
            width: 300,
        },

        selectField: {
            paddingTop: 10,
            paddingBottom: 10,
            borderColor: theme.palette.background.default,
            backgroundColor: theme.palette.background.default,
            width: 100,
        },

        label: {
            paddingRight: theme.spacing(4),
            width: 100,
            fontWeight: "400",
            color: 'black',
        },

        seachButton: {
            hover: {
                backgroundColor: "none",
            }
        },

        nested: {
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(4),
        },
    })


export const FormTableClass = (theme) => ({

    ...tooltipStyle,
    ...checkboxAdnRadioStyle,

    table: {
        paddingTop: 10,
        marginBottom: "0",
        overflow: "visible",
        borderTop: "1px",
    },
    tableRow: {
        position: "relative",
        borderBottom: "1px solid " + grayColor[5],
    },
    tableActions: {
        display: "flex",
        border: "none",
        padding: "12px 8px !important",
        verticalAlign: "middle",
    },

    tableCell: {
        ...defaultFont,
        padding: "8px",
        verticalAlign: "middle",
        border: "none",
        lineHeight: "1.42857143",
        fontSize: "14px",
    },

    tableCellRoot: {
        verticalAlign: "middle",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        borderTop: "0",
    },

    tableCellRootHead: {
        color: "#731b1b",
        backgroundColor: "#f6f9fc",
        verticalAlign: "middle",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        borderTop: "0",
    },

    tableCellRootBodyHead: {
        textTransform: "unset!important",
        fontSize: ".8125rem",
    },

    tableCellActive: {
        verticalAlign: "middle",
        backgroundColor: successColor[0],
    },

    tableCellInactive: {
        verticalAlign: "middle",
        backgroundColor: dangerColor[0],
    },

    tableActionButton: {
        width: "27px",
        height: "27px",
        padding: "0",
    },
    tableActionButtonIcon: {
        width: "17px",
        height: "17px",
    },
    edit: {
        backgroundColor: "transparent",
        color: primaryColor[0],
        boxShadow: "none",
    },
    remove: {
        backgroundColor: "transparent",
        color: dangerColor[0],
        boxShadow: "none",
    },

    restore: {
        backgroundColor: "transparent",
        color: successColor[0],
        boxShadow: "none",
    },
})