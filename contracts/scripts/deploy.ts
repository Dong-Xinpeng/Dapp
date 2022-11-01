import { ethers } from "hardhat";

async function main() {
  const StudentSocietyDAO = await ethers.getContractFactory("StudentSocietyDAO");
  const studentSocietyDAO = await StudentSocietyDAO.deploy();
  await studentSocietyDAO.deployed();

  console.log(`StudentSocietyDAO deployed to ${studentSocietyDAO.address}`)

  const erc20 = await studentSocietyDAO.studentERC20()
  console.log(`erc20 contract has been deployed successfully in ${erc20}`)

  const erc721 = await studentSocietyDAO.myERC721()
  console.log(`myERC721 contract has been deployed successfully in ${erc721}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
