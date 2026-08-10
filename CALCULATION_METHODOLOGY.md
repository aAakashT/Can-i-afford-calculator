# Calculation methodology

The score is a decision-support heuristic, not an official standard or a promise that a purchase is safe.

## EMI

For principal `P`, annual interest rate `r`, and tenure `n` months:

```text
monthly_rate = r / 100 / 12
EMI = P × monthly_rate × (1 + monthly_rate)^n / ((1 + monthly_rate)^n − 1)
```

At 0% interest, EMI is `P / n`. Cash purchases have zero EMI and zero financing cost. If a financed purchase has no valid tenure, the API rejects it; the UI’s initial mode is explicit and can be changed.

## Safety settings

Risk settings are configurable in `RISK_SETTINGS` / the frontend calculation module:

| Profile | Max total debt ratio | Emergency target | Buffer target |
| --- | ---: | ---: | ---: |
| Conservative | 30% | 6 months | 1.5 months of essentials |
| Balanced | 40% | 4 months | 1 month of essentials |
| Aggressive | 50% | 3 months | 0.6 months of essentials |

These thresholds are transparent product assumptions. They are not scientifically universal recommendations.

## Score

The 0–100 score starts at 100 and adjusts for:

- total debt-to-income burden;
- negative monthly buffer;
- emergency-fund shortfall;
- purchase size relative to income and savings;
- positive monthly buffer and emergency coverage.

Classification is configurable by the thresholds in the calculation module: 80+ comfortable, 65–79 affordable, 50–64 borderline, 30–49 risky, below 30 not affordable.

## Recommended maximum

For cash purchases, the maximum is current savings minus the selected emergency fund. For financed purchases, it combines that safe cash amount with the principal supported by the maximum EMI for the selected risk profile and term.

## Wait-to-afford

The estimate protects the recommended emergency fund and divides the remaining gap by current monthly savings capacity. The UI also lets the user test a different monthly savings amount. It is a planning estimate, not a forecast of income or investment returns.
