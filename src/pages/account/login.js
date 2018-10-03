import React from 'react'
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo'
import { Link, navigate } from 'gatsby'
import ContextConsumer from '../../layouts/context'
import GuestLayout from '../../components/account/GuestLayout'
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup'
import { parseErrors } from '../../helpers/formErrors'

const CUSTOMER_LOGIN = gql`
mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
        customerAccessToken {
            accessToken
            expiresAt
        }
        customerUserErrors {
            field
            message
        }
    }
}
`

const FormSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is Required'),
    password: Yup.string()
        .required('Password is Required'),
})

class Login extends React.Component {
    render () {
        const pageContent = (
            <ContextConsumer>
                {({ set }) => {
                    return <>
                        <h1>Log In</h1>
                        <Mutation mutation={CUSTOMER_LOGIN}>
                            {(customerLogin, { loading }) => {
                                return (
                                    <Formik
                                        initialValues={{
                                            form: '',
                                            email: '',
                                            password: '',
                                        }}
                                        validationSchema={FormSchema}
                                        onSubmit={
                                            (values, actions) => {
                                                if (!values.email || !values.password) {
                                                    return
                                                }

                                                customerLogin({
                                                    variables: {
                                                        input: {
                                                            "email": values.email,
                                                            "password": values.password,
                                                        }
                                                    }
                                                }).then((res) => {
                                                    if (res.data.customerAccessTokenCreate.customerAccessToken) {
                                                        set({
                                                            customerAccessToken: res.data.customerAccessTokenCreate.customerAccessToken,
                                                        })
                                                    } else {
                                                        const errors = parseErrors(res.data.customerAccessTokenCreate.customerUserErrors)
                                                        actions.setErrors(errors)
                                                    }
                                                })
                                            }
                                        }
                                        render={({
                                            handleSubmit,
                                            handleChange,
                                            handleBlur,
                                            isSubmitting,
                                            values,
                                            errors,
                                            touched
                                        }) => (
                                            <form onSubmit={handleSubmit}>
                                                <ErrorMessage name="form" />
                                                <ul>
                                                    <li>
                                                        <label htmlFor="loginEmail">Email</label>
                                                        <input id="loginEmail" type="email" name="email" value={values.email} onChange={handleChange} required="" />
                                                        <ErrorMessage name="email" />
                                                    </li>
                                                    <li>
                                                        <label htmlFor="loginPassword">Password</label>
                                                        <input id="loginPassword" type="password" name="password" value={values.password} onChange={handleChange} required="" />
                                                        <ErrorMessage name="password" />
                                                    </li>
                                                </ul>
                                                {
                                                    (loading)
                                                        ? <button disabled="disabled">Logging In</button>
                                                        : <button disabled={
                                                            isSubmitting ||
                                                            !!(errors.email && touched.email) ||
                                                            !!(errors.password && touched.password)
                                                            }>Log In</button>
                                                }
                                            </form>
                                        )}
                                    />
                                )
                            }}
                        </Mutation>
                        <Link to={`/account/forgotpassword`}>Forgot Password</Link>
                        <Link to={`/account/register`}>Sign Up</Link>
                    </>
                }}
            </ContextConsumer>
        )

        return (
            <GuestLayout>
                {pageContent}
            </GuestLayout>
        )
    }
}

export default Login