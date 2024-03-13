import { useState, useRef } from "react";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import api from "../../api/api";
import ReCaptcha from "react-google-recaptcha";
import { useAuth } from "../../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import Image from "/logo.png";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminCode: "", // Nuevo campo para el código
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const captcha = useRef(null);

  const [codeSendend, setcodeSendend] = useState(false);
  const [codeSendendText, setcodeSendendText] = useState("");

  const auth = useAuth();
  const goTo = useNavigate();

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captcha.current.getValue()) {
      setError("* - Please, check the captcha");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("* - Please, enter a valid email");
      return;
    }

    if (formData.password.length < 8) {
      setError("* - Please, enter a valid password (min 8 characters)");
      return;
    }

    // Agregar lógica para manejar el envsío del código por correo electrónico
    if (formData.code) {
      // Aquí puedes implementar el envío del código por correo electrónico
      console.log(`Código enviado a ${formData.email}: ${formData.code}`);
    }

    try {
      const response = await api.post("/auth/login/admins", formData);
      if (response.data.token) {
        auth.saveUser(response.data);
        goTo("/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (typeof error.response.data.message === "string") {
        setError(`* - ${error.response.data.message}`);
      } else if (Array.isArray(error.response.data.message)) {
        setError(`* - ${error.response.data.message[0]}`);
      } else {
        setError("* - Something went wrong!");
      }
    }
  };

  const validateEmail = (email) => {
    // Validación de correo electrónico utilizando una expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onChange = () => {
    setError("");
  };

  const handleSendCode = async () => {
    try {
      // Puedes utilizar la misma lógica que usas para el envío del código en handleSubmit
      if (!validateEmail(formData.email)) {
        setError("* - Please, enter a valid email");
        return;
      }

      const response = await api.post("/auth/send-code-admin", {
        email: formData.email,
      });
      setcodeSendend(true);
      setcodeSendendText(response.data.data);

      console.log(`Código enviado a ${formData.email}`);
    } catch (error) {
      console.log(error);
      setError("* - " + error.response.data.message);
    }
  };
  return (
    <main className="flex h-screen">
      <div className="w-full lg:w-2/6 flex flex-col items-center justify-center bg-[#555CB3] shadow-[0_0px_20px_10px_rgba(0,0,0,0.6)] z-10">
        <div className="w-8/12">
          <div className="flex justify-center items-center text-4xl space-x-4 mb-10">
            <img src={Image} className="w-auto h-16 text-white" />
            <h2
              style={{ textShadow: "2px 2px 1px #B45946", color: "white" }}
              className="font-semibold text-white text-3xl tracking-widest text-shadow-lg"
            >
              PSROCKOLA
            </h2>
          </div>
          <p className="text-white font-bold text-lg my-4">¡Empecemos!</p>
          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="mb-6">
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email"
                variant="outlined"
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ffffff", // color del borde predeterminado
                    },
                    "&:hover fieldset": {
                      borderColor: "#ffffff", // color del borde al pasar el mouse
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ffffff", // color del borde cuando está enfocado
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ffffff", // color de la etiqueta predeterminado
                    "&.Mui-focused": {
                      color: "#ffffff", // color del label cuando está enfocado
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#ffffff", // color del texto
                  },
                }}
              />
            </div>
            <div className="relative mb-6">
              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleInputChange}
                label="Contraseña"
                variant="outlined"
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className=" text-white hover:text-gray-100"
                    >
                      {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                    </button>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ffffff", // color del borde predeterminado
                    },
                    "&:hover fieldset": {
                      borderColor: "#ffffff", // color del borde al pasar el mouse
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ffffff", // color del borde cuando está enfocado
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ffffff", // color de la etiqueta predeterminado
                    "&.Mui-focused": {
                      color: "#ffffff", // color del label cuando está enfocado
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#ffffff", // color del texto
                  },
                }}
              />
            </div>
            <div className="mb-6">
              <TextField
                id="adminCode"
                name="adminCode"
                label="Código del Administrador"
                variant="outlined"
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ffffff", // color del borde predeterminado
                    },
                    "&:hover fieldset": {
                      borderColor: "#ffffff", // color del borde al pasar el mouse
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ffffff", // color del borde cuando está enfocado
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#ffffff", // color de la etiqueta predeterminado
                    "&.Mui-focused": {
                      color: "#ffffff", // color del label cuando está enfocado
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#ffffff", // color del texto
                  },
                }}
              />
            </div>
            <div className="flex justify-center my-6">
              <ReCaptcha
                ref={captcha}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={onChange}
              />
            </div>
            <div className="flex justify-between">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  bgcolor: "#F66E0C",
                  borderRadius: "20px",
                  height: "40px",
                  "&:hover": {
                    bgcolor: "#FF6B00",
                  },
                }}
              >
                INICIAR
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleSendCode}
                sx={{
                  bgcolor: "#1E40AF",
                  borderRadius: "20px",
                  height: "40px",
                  "&:hover": {
                    bgcolor: "#1C3FAA",
                  },
                }}
              >
                Enviar Código
              </Button>
            </div>
          </form>
        </div>
        <div className="w-8/12 h-24 flex justify-center">
          <p className="text-red-400  font-bold relative text-2xl my-6">
            {error}
          </p>
          <p className="text-green-400  font-bold relative text-2xl my-6">
            {codeSendendText}
          </p>
        </div>
      </div>
      <div
        className="lg:w-4/6 bg-white"
        style={{
          backgroundImage: `url(/background_login.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </main>
  );
}

export default Login;
