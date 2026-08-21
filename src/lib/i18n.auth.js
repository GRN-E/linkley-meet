/* Extra auth strings — merge like the project ones (see FIX-AUTH.md step 4). */
export const AUTH_I18N = {
  mn: {
    auth_check_email: "Бүртгэл үүслээ. И-мэйлээ шалгаад баталгаажуулна уу, дараа нь нэвтэрнэ үү.",
    auth_pass_hint: "Хамгийн багадаа 6 тэмдэгт",
    auth_err_exists: "Энэ и-мэйл аль хэдийн бүртгэлтэй байна. Нэвтэрнэ үү.",
    auth_err_bad: "И-мэйл эсвэл нууц үг буруу байна.",
    auth_err_unconfirmed: "И-мэйл хаяг баталгаажаагүй байна. И-мэйлээ шалгана уу.",
    auth_err_short: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.",
    auth_err_smtp: "Баталгаажуулах и-мэйл илгээхэд алдаа гарлаа. Админ 'Confirm email'-г унтраах шаардлагатай.",
    auth_err_rate: "Хэт олон удаа оролдлоо. Хэсэг хүлээгээд дахин оролдоно уу.",
  },
  en: {
    auth_check_email: "Account created. Please confirm your email, then log in.",
    auth_pass_hint: "At least 6 characters",
    auth_err_exists: "That email is already registered. Please log in.",
    auth_err_bad: "Wrong email or password.",
    auth_err_unconfirmed: "Email not confirmed yet - check your inbox.",
    auth_err_short: "Password must be at least 6 characters.",
    auth_err_smtp: "Could not send the confirmation email. Turn off 'Confirm email' in Supabase.",
    auth_err_rate: "Too many attempts. Please wait a moment and try again.",
  },
};
