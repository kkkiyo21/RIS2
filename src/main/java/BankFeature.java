public class BankFeature extends CardDecorator {
    public BankFeature(Card card) {
        super(card);
    }

    @Override
    public String getInfo() {
        return super.getInfo() + ", Банковская карта";
    }
}
