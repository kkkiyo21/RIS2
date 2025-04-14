public class Main {
    public static void main(String[] args) {
        Card card = new BasicCard();
        card = new PassportFeature(card);
        card = new InsuranceFeature(card);
        card = new BankFeature(card);

        System.out.println(card.getInfo());
    }
}
