import React from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import c from "classnames";
import supabase from "../supabase";

const formSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const Login: React.FC = () => {
  return (
    <div className="grid place-items-center bg-gray-200 min-h-screen">
      <main className="px-6 py-4 bg-white rounded-xl border border-gray-400 shadow">
        <h1 className="text-4xl m-4 font-bold">Login to Chat</h1>
        <Formik
          initialValues={{
            email: "",
          }}
          validationSchema={formSchema}
          onSubmit={async (
            values,
            { setSubmitting, setValues, setTouched }
          ) => {
            const { error } = await supabase.auth.signIn({
              email: values.email,
            });
            setSubmitting(false);
            if (error) {
              alert("An error occured: " + error.message);
              return;
            }
            alert("Check your email!");
            setValues({ email: "" });
            setTouched({ email: false });
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Field
                name="email"
                className="px-4 py-2 w-full border border-gray-500 rounded"
                placeholder="Enter your email"
                type="email"
              ></Field>
              {touched.email && errors.email && (
                <div className="my-1 text-red-500 text-sm">{errors.email}</div>
              )}
              <p className="my-4 flex flex-col gap-2">
                <button
                  type="submit"
                  className={c(
                    "w-full px-4 py-2 border border-transparent rounded font-semibold text-white transition-colors duration-200",
                    !isSubmitting
                      ? "bg-blue-500 cursor-pointer "
                      : "bg-blue-700 cursor-not-allowed"
                  )}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : "Login with Email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    supabase.auth.signIn({ provider: "github" });
                  }}
                  className={c(
                    "w-full px-4 py-2 border border-transparent rounded font-semibold text-white transition-colors duration-200",
                    !isSubmitting
                      ? "bg-black cursor-pointer "
                      : "bg-black cursor-not-allowed"
                  )}
                  disabled={isSubmitting}
                >
                  Login with Github
                </button>
              </p>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
};

export default Login;
