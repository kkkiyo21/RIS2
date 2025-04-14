public class PassportFeature extends CardDecorator {
    public PassportFeature(Card card) {
        super(card);
    }

    @Override
    public String getInfo() {
        return super.getInfo() + ", Паспорт";
    }
}
