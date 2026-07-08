import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BankAccountSummary, PersonalDetails } from "@/types/domain.types";
import { PersonalDetailsPanel } from "./PersonalDetailsPanel";

const personalDetails: PersonalDetails = {
  firstName: "Jane",
  lastName: "Doe",
  dateOfBirth: "1980-10-29",
  iban: "AT611904300234573201",
  country: "AT",
  city: "Vienna",
  address: "Main St 1",
  postalCode: "1010",
  employmentStatus: "Employed",
  employer: "Acme Corp",
};

const account: BankAccountSummary = {
  session: "session-1",
  currency: "EUR",
  currentBalance: 1234.5,
  previousMonthBalance: 1000,
};

describe("PersonalDetailsPanel", () => {
  it("renders every known personal-details field", () => {
    render(<PersonalDetailsPanel personalDetails={personalDetails} accounts={[]} />);

    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("1980-10-29")).toBeInTheDocument();
    expect(screen.getByText("AT611904300234573201")).toBeInTheDocument();
    expect(screen.getByText("Vienna")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders unrecognized `extra` fields generically", () => {
    render(
      <PersonalDetailsPanel
        personalDetails={{ ...personalDetails, extra: { riskScore: 42 } }}
        accounts={[]}
      />,
    );

    expect(screen.getByText("Risk Score")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("omits empty-string fields from the known list", () => {
    render(
      <PersonalDetailsPanel personalDetails={{ ...personalDetails, employer: "" }} accounts={[]} />,
    );

    expect(screen.queryByText("Employer")).not.toBeInTheDocument();
  });

  it("shows an empty message when personalDetails is null", () => {
    render(<PersonalDetailsPanel personalDetails={null} accounts={[]} />);
    expect(screen.getByText("No personal details to display.")).toBeInTheDocument();
  });

  it("renders an Accounts section with balances when accounts are present", () => {
    render(<PersonalDetailsPanel personalDetails={personalDetails} accounts={[account]} />);

    expect(screen.getByText("Accounts")).toBeInTheDocument();
    expect(screen.getByText("session-1")).toBeInTheDocument();
    expect(screen.getByText("1234.50 EUR")).toBeInTheDocument();
    expect(screen.getByText("1000.00 EUR")).toBeInTheDocument();
  });

  it("does not render an Accounts section when there are no accounts", () => {
    render(<PersonalDetailsPanel personalDetails={personalDetails} accounts={[]} />);
    expect(screen.queryByText("Accounts")).not.toBeInTheDocument();
  });
});
