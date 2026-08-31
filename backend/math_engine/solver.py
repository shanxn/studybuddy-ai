import sympy as sp
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import re
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

class MathSolver:
    def solve_equation(self, equation_str: str):
        """Solves calculus problems, algebraic equations, matrices, etc."""
        try:
            # 1. Check for derivatives
            if equation_str.startswith("d/d"):
                return self._solve_derivative(equation_str)
            
            # 2. Check for integrals
            if "integrate" in equation_str.lower() or "int " in equation_str.lower():
                return self._solve_integral(equation_str)
                
            # 3. Check for limits
            if "limit" in equation_str.lower() or "lim" in equation_str.lower():
                return self._solve_limit(equation_str)
                
            # 4. Check for matrices
            if "matrix" in equation_str.lower() or "[" in equation_str:
                return self._solve_matrix(equation_str)

            # 5. Default: Algebraic equation solver
            return self._solve_algebraic(equation_str)
            
        except Exception as e:
            return {"status": "error", "message": f"Could not solve: {str(e)}"}

    def _parse(self, expr_str):
        transformations = (standard_transformations + (implicit_multiplication_application,))
        return parse_expr(expr_str.replace("^", "**"), transformations=transformations)

    def _solve_derivative(self, eq_str):
        # Format: d/dx (x^2 + 2x)
        match = re.search(r"d/d([a-zA-Z])\s*\((.*?)\)", eq_str)
        if match:
            var = sp.Symbol(match.group(1))
            expr = self._parse(match.group(2))
            deriv = sp.diff(expr, var)
            steps = [
                f"Expression: {sp.pretty(expr)}",
                f"Derivative with respect to {var}:",
                f"{sp.pretty(deriv)}"
            ]
            return {"status": "success", "explanation": "\n\n".join(steps), "plot_base64": self._generate_plot(expr, var)}
        raise ValueError("Invalid derivative syntax. Use: d/dx(expression)")

    def _solve_integral(self, eq_str):
        # Very loose parsing for integration
        clean_str = re.sub(r"(integrate|int)\s+", "", eq_str, flags=re.IGNORECASE).strip()
        var = sp.Symbol('x')
        expr = self._parse(clean_str)
        integral = sp.integrate(expr, var)
        steps = [
            f"Expression: {sp.pretty(expr)}",
            f"Indefinite Integral:",
            f"{sp.pretty(integral)} + C"
        ]
        return {"status": "success", "explanation": "\n\n".join(steps), "plot_base64": self._generate_plot(expr, var)}

    def _solve_limit(self, eq_str):
        # Format: limit x->0 (1/x)
        match = re.search(r"(?:limit|lim)\s+([a-zA-Z])\s*->\s*([a-zA-Z0-9.\-]+)\s*\((.*?)\)", eq_str, re.IGNORECASE)
        if match:
            var_str, val_str, expr_str = match.groups()
            var = sp.Symbol(var_str)
            val = float(val_str) if '.' in val_str else int(val_str)
            expr = self._parse(expr_str)
            lim = sp.limit(expr, var, val)
            steps = [f"Limit of {sp.pretty(expr)} as {var} approaches {val}:", f"{sp.pretty(lim)}"]
            return {"status": "success", "explanation": "\n\n".join(steps), "plot_base64": self._generate_plot(expr, var)}
        raise ValueError("Invalid limit syntax. Use: lim x->0 (expression)")

    def _solve_matrix(self, eq_str):
        # Naive matrix evaluation
        parsed = self._parse(eq_str)
        if isinstance(parsed, sp.MatrixBase):
            steps = [f"Matrix:\n{sp.pretty(parsed)}"]
            if parsed.is_square:
                try:
                    steps.append(f"Determinant: {parsed.det()}")
                    steps.append(f"Eigenvalues: {parsed.eigenvals()}")
                except:
                    pass
            return {"status": "success", "explanation": "\n\n".join(steps), "plot_base64": None}
        raise ValueError("Not a valid matrix.")

    def _solve_algebraic(self, eq_str):
        x, y = sp.symbols('x y')
        if "=" in eq_str:
            left, right = eq_str.split("=")
            parsed_eq = sp.Eq(self._parse(left), self._parse(right))
            roots = sp.solve(parsed_eq, x)
            expr_to_plot = sp.solve(parsed_eq, y)[0] if y in parsed_eq.free_symbols else None
            # fallback if expression implies f(x)=something
            if not expr_to_plot and len(parsed_eq.free_symbols) == 1:
                expr_to_plot = parsed_eq.lhs - parsed_eq.rhs
        else:
            parsed_eq = self._parse(eq_str)
            roots = sp.solve(sp.Eq(parsed_eq, 0), x)
            expr_to_plot = parsed_eq

        steps = [f"Interpreted as: {sp.pretty(parsed_eq)}"]
        if roots:
            steps.append(f"Roots / Solutions for x: {roots}")
        
        # Simple expansion and factoring
        steps.append(f"Expanded: {sp.pretty(sp.expand(expr_to_plot or parsed_eq))}")
        steps.append(f"Factored: {sp.pretty(sp.factor(expr_to_plot or parsed_eq))}")
            
        plot_base64 = self._generate_plot(expr_to_plot, x) if expr_to_plot else None
            
        return {
            "status": "success",
            "explanation": "\n\n".join(steps),
            "plot_base64": plot_base64
        }

    def _generate_plot(self, expr, symbol, x_range=(-10, 10)):
        if not expr: return None
        try:
            x_vals = np.linspace(x_range[0], x_range[1], 400)
            f = sp.lambdify(symbol, expr, "numpy")
            y_vals = f(x_vals)
            if isinstance(y_vals, (int, float)):
                y_vals = np.full_like(x_vals, y_vals)
                
            plt.figure(figsize=(6, 4))
            plt.plot(x_vals, y_vals, label=f"y = {expr}")
            plt.axhline(0, color='black', linewidth=0.5)
            plt.axvline(0, color='black', linewidth=0.5)
            plt.grid(color='gray', linestyle='--', linewidth=0.5)
            plt.legend()
            plt.title("Graph Visualization")
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            buf.seek(0)
            plt.close()
            return base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            plt.close()
            print(f"Plotting error: {e}")
            return None

math_solver = MathSolver()
