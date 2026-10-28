export async function Footer() {
    "use cache";

    const currentYear = new Date().getFullYear();

    return (

        <footer className="py-6 text-center text-gray-500 text-sm md:text-base">
            <p>
                Todos os direitos reservados © {currentYear} -{" "}
                <span className="transition-colors duration-300 hover:text-black">
                    @ILTEC
                </span>
            </p>
        </footer>
    );
}