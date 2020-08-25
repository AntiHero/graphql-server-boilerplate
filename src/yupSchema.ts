import { passwordTooShort } from './modules/register/errorMessages';
import * as yup from "yup";


export const registerPasswordValidation = yup.string().min(6, passwordTooShort).max(255);