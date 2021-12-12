import React from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { useStore } from "@nanostores/react";
import {
  profile as profileStore,
  user as userStore,
} from "../../lib/stores/user";
import Loading from "../../lib/components/Loading";
import c from "classnames";
import supabase from "../../lib/supabase";

const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  gravatar_hash: yup
    .string()
    .required("Gravatar hash is required")
    .test("is-md5", "Gravatar hash is not valid", (value) => {
      if (!value) return false;
      if (value === "default" || value === "placeholder") return true;
      return /^[a-f0-9]{32}$/.test(value);
    }),
});

const ChatSettings: React.FC = () => {
  const profile = useStore(profileStore);
  const user = useStore(userStore);

  if (!profile || !user) return <Loading />;

  return (
    <React.Fragment>
      <h1 className="text-5xl font-bold my-4">Settings</h1>
      <Formik
        initialValues={{
          name: profile.name,
          gravatar_hash: profile.avatar_url.split("/").pop()!.split("?")[0],
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const { error } = await supabase.rpc("update_profile", {
            profile_id: profile.id,
            name: values.name,
            avatar_hash: values.gravatar_hash,
          });
          setSubmitting(false);
          if (error) return alert("An error occurred: " + error.message);
          window.location.reload();
        }}
        validationSchema={profileSchema}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <Field
                className="rounded px-4 py-2 border border-gray-500 w-full"
                placeholder={profile.name}
                name="name"
                type="text"
                id="name"
              />
              {errors.name && touched.name && (
                <div className="text-red-500 text-sm my-1">{errors.name}</div>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="gravatar_hash"
              >
                Gravatar URL
              </label>
              <Field
                className="rounded px-4 py-2 border border-gray-500 w-full"
                placeholder={profile.avatar_url.split("/").pop()!.split("?")[0]}
                name="gravatar_hash"
                type="text"
                id="gravatar_hash"
              />
              {errors.gravatar_hash && touched.gravatar_hash && (
                <div className="text-red-500 text-sm my-1">
                  {errors.gravatar_hash}
                </div>
              )}
            </div>
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
                {isSubmitting ? "..." : "Save"}
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default ChatSettings;
