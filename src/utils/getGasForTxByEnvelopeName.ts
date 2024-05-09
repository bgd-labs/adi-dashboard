export const getGasForTxByEnvelopeType = (envelopeType: string | undefined) => {
  switch (envelopeType) {
    case "Activate Voting Message":
      return 300000;
    case "Voting Results Message":
      return 250000;
    case "Payload Execution Message":
      return 150000;
    default:
      return 300000;
  }
};
