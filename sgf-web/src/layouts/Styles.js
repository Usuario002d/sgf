export const FormClasses = (theme) =>
    ({
        login: {
            fontFamily: "sans-serif",
            textAlign: "center",
            marginTop: theme.spacing(10),
        },

        loginHeader: {
            marginBottom: theme.spacing(0),
            margin: "0 auto",
        },

        loginHeader_H3: {
            fontWeight: "bold",
            fontSize: "25px",
            padding: "15px",
            margin: "0 0 10px",
            color: "#216600",
            fontFamily: "Ubuntu-Regular",
        },

        loginHeader_img: {
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "50%",
            height: "60px",
        },

        loginHeader_errorMsgOld: {
            backgroundColor: "#9c27b0",
            color: "#FFFFFF",
            textAlign: "center",
            display: "block",
            maxWidth: "450px",
            border: "1px solid black",
            margin: "0 auto",
            padding: "10px 0 10px 0",
        },

        loginHeader_errorMsg: {
            maxWidth: "30%",
            margin: "0 auto",
            padding: "0 0 0 0",
        },

        paper: {
            overflow: "hidden",
            maxWidth: '30%',
            margin: "0 auto",
        },
        root: {
            position: "absolute",
            width: "fit-content",
            height: "fit-content",
            background: "white",
            paddingRight: theme.spacing(4),
            paddingLeft: theme.spacing(0),
            border: "1px groove green",
        },

        button: {
            marginRight: theme.spacing(0),
            background: "#216600",
        },
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
            width: 300,
        },
        label: {
            paddingRight: theme.spacing(4),
            width: 80,
            fontWeight: "400",
            color: 'black',
        },
    })